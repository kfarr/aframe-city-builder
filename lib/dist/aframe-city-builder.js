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
	        var controlEl = this.el;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDI4MDMyZTM0NWIwZDUxMTMyYmEiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL2FjdGlvbi1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJyZWdpc3RlckNvbXBvbmVudCIsInNjaGVtYSIsIm1lbnVJRCIsInR5cGUiLCJkZWZhdWx0IiwibXVsdGlwbGUiLCJhZGRFdmVudExpc3RlbmVycyIsIm1lbnVFbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJkYXRhIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uQWN0aW9uQ2hhbmdlIiwiYmluZCIsIm9uQWN0aW9uU2VsZWN0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5pdCIsImNvbnNvbGUiLCJsb2ciLCJvcHRpb25WYWx1ZSIsImNvbXBvbmVudHMiLCJzZWxlY3RlZE9wdGlvblZhbHVlIiwiaGFuZGxlQWN0aW9uU3RhcnQiLCJoYW5kbGVBY3Rpb25FbmQiLCJwcmV2aW91c0FjdGlvbiIsInBsYXkiLCJwYXVzZSIsInJlbW92ZSIsImNvbnRyb2xFbCIsImVsIiwic2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwib2JqZWN0Q291bnQiLCJodW1hbml6ZSIsInN0ciIsImZyYWdzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsImpvaW4iLCJtZW51SWQiLCJvblVuZG8iLCJvbk9iamVjdENoYW5nZSIsIm9uUGxhY2VPYmplY3QiLCJsaXN0IiwiZ3JvdXBKU09OQXJyYXkiLCJmb3JFYWNoIiwiZ3JvdXBOYW1lIiwiaW5kZXgiLCJyZXF1ZXN0VVJMIiwicmVxdWVzdCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNlbmQiLCJvbmxvYWQiLCJyZXNwb25zZSIsIm5ld09wdGdyb3VwRWwiLCJjcmVhdGVFbGVtZW50Iiwib3B0aW9uc0hUTUwiLCJvYmplY3REZWZpbml0aW9uIiwiaW5uZXJIVE1MIiwiYXBwZW5kQ2hpbGQiLCJ0aGlzSXRlbUlEIiwiaWQiLCJ0aGlzSXRlbUVsIiwicXVlcnlTZWxlY3RvciIsIm9iamVjdElkIiwicGFyc2VJbnQiLCJhdHRyaWJ1dGVzIiwidmFsdWUiLCJvYmplY3RHcm91cCIsInJvdW5kaW5nIiwib2JqZWN0QXJyYXkiLCJ0aGlzSXRlbVdvcmxkUG9zaXRpb24iLCJvYmplY3QzRCIsImdldFdvcmxkUG9zaXRpb24iLCJ0aGlzSXRlbVdvcmxkUm90YXRpb24iLCJnZXRXb3JsZFJvdGF0aW9uIiwib3JpZ2luYWxQb3NpdGlvblN0cmluZyIsIngiLCJ5IiwieiIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblgiLCJNYXRoIiwicm91bmQiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWiIsInJvdW5kZWRQb3NpdGlvblN0cmluZyIsInRoaXNJdGVtV29ybGRSb3RhdGlvblgiLCJfeCIsIlBJIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSIsIl95IiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiIsIl96Iiwib3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nIiwicm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJyb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyIsIm5ld0lkIiwiJCIsImNsYXNzIiwic2NhbGUiLCJyb3RhdGlvbiIsImZpbGUiLCJhcHBlbmRUbyIsIm5ld09iamVjdCIsInByb3BlcnR5IiwiZHVyIiwiZnJvbSIsInRvIiwic2VsZWN0ZWRPcHRncm91cFZhbHVlIiwibmV3T2JqZWN0SWQiLCJzZWxlY3RlZE9wdGlvbkluZGV4Iiwib2JqIiwibXRsIiwiZmx1c2hUb0RPTSIsInByZXZpb3VzT2JqZWN0IiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwib2JqZWN0TG9hZGVyIiwiTU9ERUxfVVJMIiwiVEhSRUUiLCJPYmplY3RMb2FkZXIiLCJjcm9zc09yaWdpbiIsImxvYWQiLCJjaGlsZHJlbiIsInJlY2VpdmVTaGFkb3ciLCJtYXRlcmlhbCIsInNoYWRpbmciLCJGbGF0U2hhZGluZyIsImFkZCIsInJlZ2lzdGVyU2hhZGVyIiwiY29sb3JUb3AiLCJpcyIsImNvbG9yQm90dG9tIiwidmVydGV4U2hhZGVyIiwiZnJhZ21lbnRTaGFkZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUN0Q0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FBUjtBQUNBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSLEU7Ozs7OztBQ0xBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxhQUFhO0FBQ3hCLGlCQUFnQixjQUFjO0FBQzlCLHVCQUFzQixlQUFlO0FBQ3JDLGlCQUFnQjtBQUNoQixJQUFHOztBQUVIO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNEQUFxRCw4QkFBOEIsRUFBRTtBQUNyRiw0QkFBMkIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTRDLDBCQUEwQixFQUFFO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjO0FBQ2QsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWlFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBWTtB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Z0IsQ0FDZCx3QkFEYyxFQUVkLDJCQUZjLEVBSWQsOEJBSmMsRUFNZCxhQU5jLEVBUWQsR0FSYyxFQVNaLHFEQVRZLEVBVVosZ0JBVlksRUFXWiw4QkFYWSxFQWFWLGlDQWJVLEVBZVosR0FmWSxFQWdCWiwwREFoQlksRUFrQmQsR0FsQmMsRUFtQmRsRyxJQW5CYyxDQW1CVCxJQW5CUztBQXBCbUIsRUFBckMsRSIsImZpbGUiOiJhZnJhbWUtY2l0eS1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDI4MDMyZTM0NWIwZDUxMTMyYmEiLCJyZXF1aXJlKCdhZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnYWZyYW1lLWFuaW1hdGlvbi1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnLi9saWIvYWN0aW9uLWNvbnRyb2xzLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2J1aWxkZXItY29udHJvbHMuanMnKTtcclxucmVxdWlyZSgnLi9saWIvZ3JvdW5kLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL3NreUdyYWRpZW50LmpzJyk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LmpzIiwiaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbi8qKlxuICogR3JpZEhlbHBlciBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JpZGhlbHBlcicsIHtcbiAgc2NoZW1hOiB7XG4gICAgc2l6ZTogeyBkZWZhdWx0OiA1IH0sXG4gICAgZGl2aXNpb25zOiB7IGRlZmF1bHQ6IDEwIH0sXG4gICAgY29sb3JDZW50ZXJMaW5lOiB7ZGVmYXVsdDogJ3JlZCd9LFxuICAgIGNvbG9yR3JpZDoge2RlZmF1bHQ6ICdibGFjayd9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbmNlIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkLiBHZW5lcmFsbHkgZm9yIGluaXRpYWwgc2V0dXAuXG4gICAqL1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICAgIHZhciBzaXplID0gZGF0YS5zaXplO1xuICAgIHZhciBkaXZpc2lvbnMgPSBkYXRhLmRpdmlzaW9ucztcbiAgICB2YXIgY29sb3JDZW50ZXJMaW5lID0gZGF0YS5jb2xvckNlbnRlckxpbmU7XG4gICAgdmFyIGNvbG9yR3JpZCA9IGRhdGEuY29sb3JHcmlkO1xuXG4gICAgdmFyIGdyaWRIZWxwZXIgPSBuZXcgVEhSRUUuR3JpZEhlbHBlciggc2l6ZSwgZGl2aXNpb25zLCBjb2xvckNlbnRlckxpbmUsIGNvbG9yR3JpZCApO1xuICAgIGdyaWRIZWxwZXIubmFtZSA9IFwiZ3JpZEhlbHBlclwiO1xuICAgIHNjZW5lLmFkZChncmlkSGVscGVyKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICBzY2VuZS5yZW1vdmUoc2NlbmUuZ2V0T2JqZWN0QnlOYW1lKFwiZ3JpZEhlbHBlclwiKSk7XG4gIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXG5cbnZhciBhbmltZSA9IHJlcXVpcmUoJ2FuaW1lanMnKTtcblxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbnZhciB1dGlscyA9IEFGUkFNRS51dGlscztcbnZhciBnZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5nZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5zZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzdHlsZVBhcnNlciA9IHV0aWxzLnN0eWxlUGFyc2VyLnBhcnNlO1xuXG4vKipcbiAqIEFuaW1hdGlvbiBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYW5pbWF0aW9uJywge1xuICBzY2hlbWE6IHtcbiAgICBkZWxheToge2RlZmF1bHQ6IDB9LFxuICAgIGRpcjoge2RlZmF1bHQ6ICcnfSxcbiAgICBkdXI6IHtkZWZhdWx0OiAxMDAwfSxcbiAgICBlYXNpbmc6IHtkZWZhdWx0OiAnZWFzZUluUXVhZCd9LFxuICAgIGVsYXN0aWNpdHk6IHtkZWZhdWx0OiA0MDB9LFxuICAgIGZyb206IHtkZWZhdWx0OiAnJ30sXG4gICAgbG9vcDoge2RlZmF1bHQ6IGZhbHNlfSxcbiAgICBwcm9wZXJ0eToge2RlZmF1bHQ6ICcnfSxcbiAgICByZXBlYXQ6IHtkZWZhdWx0OiAwfSxcbiAgICBzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHBhdXNlRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdW1lRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHRvOiB7ZGVmYXVsdDogJyd9XG4gIH0sXG5cbiAgbXVsdGlwbGU6IHRydWUsXG5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXlBbmltYXRpb25Cb3VuZCA9IHRoaXMucGxheUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGF1c2VBbmltYXRpb25Cb3VuZCA9IHRoaXMucGF1c2VBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3VtZUFuaW1hdGlvbkJvdW5kID0gdGhpcy5yZXN1bWVBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3RhcnRBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdGFydEFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVwZWF0ID0gMDtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLmF0dHJOYW1lO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcGVydHlUeXBlKGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIWRhdGEucHJvcGVydHkpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBCYXNlIGNvbmZpZy5cbiAgICB0aGlzLnJlcGVhdCA9IGRhdGEucmVwZWF0O1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICBiZWdpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25iZWdpbicpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1iZWdpbicpO1xuICAgICAgfSxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsLmVtaXQoJ2FuaW1hdGlvbmNvbXBsZXRlJyk7XG4gICAgICAgIGVsLmVtaXQoYXR0ck5hbWUgKyAnLWNvbXBsZXRlJyk7XG4gICAgICAgIC8vIFJlcGVhdC5cbiAgICAgICAgaWYgKC0tc2VsZi5yZXBlYXQgPiAwKSB7IHNlbGYuYW5pbWF0aW9uLnBsYXkoKTsgfVxuICAgICAgfSxcbiAgICAgIGRpcmVjdGlvbjogZGF0YS5kaXIsXG4gICAgICBkdXJhdGlvbjogZGF0YS5kdXIsXG4gICAgICBlYXNpbmc6IGRhdGEuZWFzaW5nLFxuICAgICAgZWxhc3RpY2l0eTogZGF0YS5lbGFzdGljaXR5LFxuICAgICAgbG9vcDogZGF0YS5sb29wXG4gICAgfTtcblxuICAgIC8vIEN1c3RvbWl6ZSBjb25maWcgYmFzZWQgb24gcHJvcGVydHkgdHlwZS5cbiAgICB2YXIgdXBkYXRlQ29uZmlnID0gY29uZmlnRGVmYXVsdDtcbiAgICBpZiAocHJvcFR5cGUgPT09ICd2ZWMyJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzMnIHx8IHByb3BUeXBlID09PSAndmVjNCcpIHtcbiAgICAgIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ1ZlY3RvcjtcbiAgICB9XG5cbiAgICAvLyBDb25maWcuXG4gICAgdGhpcy5jb25maWcgPSB1cGRhdGVDb25maWcoZWwsIGRhdGEsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmltYXRpb24gPSBhbmltZSh0aGlzLmNvbmZpZyk7XG5cbiAgICAvLyBTdG9wIHByZXZpb3VzIGFuaW1hdGlvbi5cbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuZGF0YS5zdGFydEV2ZW50cy5sZW5ndGgpIHsgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlOyB9XG5cbiAgICAvLyBQbGF5IGFuaW1hdGlvbiBpZiBubyBob2xkaW5nIGV2ZW50LlxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciB1cGRhdGUuXG4gICAqL1xuICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbiB8fCAhdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBEZWxheS5cbiAgICBpZiAoZGF0YS5kZWxheSkge1xuICAgICAgc2V0VGltZW91dChwbGF5LCBkYXRhLmRlbGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXkgKCkge1xuICAgICAgc2VsZi5wbGF5QW5pbWF0aW9uKCk7XG4gICAgICBzZWxmLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgZGF0YS5zdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGxheUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnBhdXNlRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wYXVzZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3VtZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdW1lQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdGFydEFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcGxheUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgcGF1c2VBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wYXVzZSgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgcmVzdW1lQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGxheSgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTtcbiAgfSxcblxuICByZXN0YXJ0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucmVzdGFydCgpO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gdHJ1ZTtcbiAgfVxufSk7XG5cbi8qKlxuICogU3R1ZmYgcHJvcGVydHkgaW50byBnZW5lcmljIGBwcm9wZXJ0eWAga2V5LlxuICovXG5mdW5jdGlvbiBjb25maWdEZWZhdWx0IChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZGF0YS5mcm9tIHx8IGdldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgcmV0dXJuIEFGUkFNRS51dGlscy5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIHRhcmdldHM6IFt7YWZyYW1lUHJvcGVydHk6IGZyb219XSxcbiAgICBhZnJhbWVQcm9wZXJ0eTogZGF0YS50byxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5LCB0aGlzLnRhcmdldHNbMF0uYWZyYW1lUHJvcGVydHkpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogRXh0ZW5kIHgveS96L3cgb250byB0aGUgY29uZmlnLlxuICovXG5mdW5jdGlvbiBjb25maWdWZWN0b3IgKGVsLCBkYXRhLCBjb25maWcpIHtcbiAgdmFyIGZyb20gPSBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIGlmIChkYXRhLmZyb20pIHsgZnJvbSA9IEFGUkFNRS51dGlscy5jb29yZGluYXRlcy5wYXJzZShkYXRhLmZyb20pOyB9XG4gIHZhciB0byA9IEFGUkFNRS51dGlscy5jb29yZGluYXRlcy5wYXJzZShkYXRhLnRvKTtcbiAgcmV0dXJuIEFGUkFNRS51dGlscy5leHRlbmQoe30sIGNvbmZpZywge1xuICAgIHRhcmdldHM6IFtmcm9tXSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5LCB0aGlzLnRhcmdldHNbMF0pO1xuICAgIH1cbiAgfSwgdG8pO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eVR5cGUgKGVsLCBwcm9wZXJ0eSkge1xuICB2YXIgc3BsaXQgPSBwcm9wZXJ0eS5zcGxpdCgnLicpO1xuICB2YXIgY29tcG9uZW50TmFtZSA9IHNwbGl0WzBdO1xuICB2YXIgcHJvcGVydHlOYW1lID0gc3BsaXRbMV07XG4gIHZhciBjb21wb25lbnQgPSBlbC5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdIHx8IEFGUkFNRS5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuXG4gIC8vIFByaW1pdGl2ZXMuXG4gIGlmICghY29tcG9uZW50KSB7IHJldHVybiBudWxsOyB9XG5cbiAgaWYgKHByb3BlcnR5TmFtZSkge1xuICAgIHJldHVybiBjb21wb25lbnQuc2NoZW1hW3Byb3BlcnR5TmFtZV0udHlwZTtcbiAgfVxuICByZXR1cm4gY29tcG9uZW50LnNjaGVtYS50eXBlO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1hbmltYXRpb24tY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qXG4gKiBBbmltZSB2MS4xLjNcbiAqIGh0dHA6Ly9hbmltZS1qcy5jb21cbiAqIEphdmFTY3JpcHQgYW5pbWF0aW9uIGVuZ2luZVxuICogQ29weXJpZ2h0IChjKSAyMDE2IEp1bGlhbiBHYXJuaWVyXG4gKiBodHRwOi8vanVsaWFuZ2Fybmllci5jb21cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAvLyBsaWtlIE5vZGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LmFuaW1lID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdmVyc2lvbiA9ICcxLjEuMyc7XG5cbiAgLy8gRGVmYXVsdHNcblxuICB2YXIgZGVmYXVsdFNldHRpbmdzID0ge1xuICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgIGRlbGF5OiAwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIGF1dG9wbGF5OiB0cnVlLFxuICAgIGRpcmVjdGlvbjogJ25vcm1hbCcsXG4gICAgZWFzaW5nOiAnZWFzZU91dEVsYXN0aWMnLFxuICAgIGVsYXN0aWNpdHk6IDQwMCxcbiAgICByb3VuZDogZmFsc2UsXG4gICAgYmVnaW46IHVuZGVmaW5lZCxcbiAgICB1cGRhdGU6IHVuZGVmaW5lZCxcbiAgICBjb21wbGV0ZTogdW5kZWZpbmVkXG4gIH1cblxuICAvLyBUcmFuc2Zvcm1zXG5cbiAgdmFyIHZhbGlkVHJhbnNmb3JtcyA9IFsndHJhbnNsYXRlWCcsICd0cmFuc2xhdGVZJywgJ3RyYW5zbGF0ZVonLCAncm90YXRlJywgJ3JvdGF0ZVgnLCAncm90YXRlWScsICdyb3RhdGVaJywgJ3NjYWxlJywgJ3NjYWxlWCcsICdzY2FsZVknLCAnc2NhbGVaJywgJ3NrZXdYJywgJ3NrZXdZJ107XG4gIHZhciB0cmFuc2Zvcm0sIHRyYW5zZm9ybVN0ciA9ICd0cmFuc2Zvcm0nO1xuXG4gIC8vIFV0aWxzXG5cbiAgdmFyIGlzID0ge1xuICAgIGFycjogZnVuY3Rpb24oYSkgeyByZXR1cm4gQXJyYXkuaXNBcnJheShhKSB9LFxuICAgIG9iajogZnVuY3Rpb24oYSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpLmluZGV4T2YoJ09iamVjdCcpID4gLTEgfSxcbiAgICBzdmc6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgaW5zdGFuY2VvZiBTVkdFbGVtZW50IH0sXG4gICAgZG9tOiBmdW5jdGlvbihhKSB7IHJldHVybiBhLm5vZGVUeXBlIHx8IGlzLnN2ZyhhKSB9LFxuICAgIG51bTogZnVuY3Rpb24oYSkgeyByZXR1cm4gIWlzTmFOKHBhcnNlSW50KGEpKSB9LFxuICAgIHN0cjogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdzdHJpbmcnIH0sXG4gICAgZm5jOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyB9LFxuICAgIHVuZDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICd1bmRlZmluZWQnIH0sXG4gICAgbnVsOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ251bGwnIH0sXG4gICAgaGV4OiBmdW5jdGlvbihhKSB7IHJldHVybiAvKF4jWzAtOUEtRl17Nn0kKXwoXiNbMC05QS1GXXszfSQpL2kudGVzdChhKSB9LFxuICAgIHJnYjogZnVuY3Rpb24oYSkgeyByZXR1cm4gL15yZ2IvLnRlc3QoYSkgfSxcbiAgICBoc2w6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9eaHNsLy50ZXN0KGEpIH0sXG4gICAgY29sOiBmdW5jdGlvbihhKSB7IHJldHVybiAoaXMuaGV4KGEpIHx8IGlzLnJnYihhKSB8fCBpcy5oc2woYSkpIH1cbiAgfVxuXG4gIC8vIEVhc2luZ3MgZnVuY3Rpb25zIGFkYXB0ZWQgZnJvbSBodHRwOi8vanF1ZXJ5dWkuY29tL1xuXG4gIHZhciBlYXNpbmdzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlYXNlcyA9IHt9O1xuICAgIHZhciBuYW1lcyA9IFsnUXVhZCcsICdDdWJpYycsICdRdWFydCcsICdRdWludCcsICdFeHBvJ107XG4gICAgdmFyIGZ1bmN0aW9ucyA9IHtcbiAgICAgIFNpbmU6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIDEgKyBNYXRoLnNpbihNYXRoLlBJIC8gMiAqIHQgLSBNYXRoLlBJIC8gMik7IH0sXG4gICAgICBDaXJjOiBmdW5jdGlvbih0KSB7IHJldHVybiAxIC0gTWF0aC5zcXJ0KCAxIC0gdCAqIHQgKTsgfSxcbiAgICAgIEVsYXN0aWM6IGZ1bmN0aW9uKHQsIG0pIHtcbiAgICAgICAgaWYoIHQgPT09IDAgfHwgdCA9PT0gMSApIHJldHVybiB0O1xuICAgICAgICB2YXIgcCA9ICgxIC0gTWF0aC5taW4obSwgOTk4KSAvIDEwMDApLCBzdCA9IHQgLyAxLCBzdDEgPSBzdCAtIDEsIHMgPSBwIC8gKCAyICogTWF0aC5QSSApICogTWF0aC5hc2luKCAxICk7XG4gICAgICAgIHJldHVybiAtKCBNYXRoLnBvdyggMiwgMTAgKiBzdDEgKSAqIE1hdGguc2luKCAoIHN0MSAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuICAgICAgfSxcbiAgICAgIEJhY2s6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQgKiB0ICogKCAzICogdCAtIDIgKTsgfSxcbiAgICAgIEJvdW5jZTogZnVuY3Rpb24odCkge1xuICAgICAgICB2YXIgcG93MiwgYm91bmNlID0gNDtcbiAgICAgICAgd2hpbGUgKCB0IDwgKCAoIHBvdzIgPSBNYXRoLnBvdyggMiwgLS1ib3VuY2UgKSApIC0gMSApIC8gMTEgKSB7fVxuICAgICAgICByZXR1cm4gMSAvIE1hdGgucG93KCA0LCAzIC0gYm91bmNlICkgLSA3LjU2MjUgKiBNYXRoLnBvdyggKCBwb3cyICogMyAtIDIgKSAvIDIyIC0gdCwgMiApO1xuICAgICAgfVxuICAgIH1cbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIGkpIHtcbiAgICAgIGZ1bmN0aW9uc1tuYW1lXSA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KCB0LCBpICsgMiApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKGZ1bmN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZWFzZUluID0gZnVuY3Rpb25zW25hbWVdO1xuICAgICAgZWFzZXNbJ2Vhc2VJbicgKyBuYW1lXSA9IGVhc2VJbjtcbiAgICAgIGVhc2VzWydlYXNlT3V0JyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gMSAtIGVhc2VJbigxIC0gdCwgbSk7IH07XG4gICAgICBlYXNlc1snZWFzZUluT3V0JyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gdCA8IDAuNSA/IGVhc2VJbih0ICogMiwgbSkgLyAyIDogMSAtIGVhc2VJbih0ICogLTIgKyAyLCBtKSAvIDI7IH07XG4gICAgICBlYXNlc1snZWFzZU91dEluJyArIG5hbWVdID0gZnVuY3Rpb24odCwgbSkgeyByZXR1cm4gdCA8IDAuNSA/ICgxIC0gZWFzZUluKDEgLSAyICogdCwgbSkpIC8gMiA6IChlYXNlSW4odCAqIDIgLSAxLCBtKSArIDEpIC8gMjsgfTtcbiAgICB9KTtcbiAgICBlYXNlcy5saW5lYXIgPSBmdW5jdGlvbih0KSB7IHJldHVybiB0OyB9O1xuICAgIHJldHVybiBlYXNlcztcbiAgfSkoKTtcblxuICAvLyBTdHJpbmdzXG5cbiAgdmFyIG51bWJlclRvU3RyaW5nID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIChpcy5zdHIodmFsKSkgPyB2YWwgOiB2YWwgKyAnJztcbiAgfVxuXG4gIHZhciBzdHJpbmdUb0h5cGhlbnMgPSBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICB2YXIgc2VsZWN0U3RyaW5nID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKGlzLmNvbChzdHIpKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc3RyKTtcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBOdW1iZXJzXG5cbiAgdmFyIHJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxuICAvLyBBcnJheXNcblxuICB2YXIgZmxhdHRlbkFycmF5ID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29uY2F0KGlzLmFycihiKSA/IGZsYXR0ZW5BcnJheShiKSA6IGIpO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIHZhciB0b0FycmF5ID0gZnVuY3Rpb24obykge1xuICAgIGlmIChpcy5hcnIobykpIHJldHVybiBvO1xuICAgIGlmIChpcy5zdHIobykpIG8gPSBzZWxlY3RTdHJpbmcobykgfHwgbztcbiAgICBpZiAobyBpbnN0YW5jZW9mIE5vZGVMaXN0IHx8IG8gaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvbikgcmV0dXJuIFtdLnNsaWNlLmNhbGwobyk7XG4gICAgcmV0dXJuIFtvXTtcbiAgfVxuXG4gIHZhciBhcnJheUNvbnRhaW5zID0gZnVuY3Rpb24oYXJyLCB2YWwpIHtcbiAgICByZXR1cm4gYXJyLnNvbWUoZnVuY3Rpb24oYSkgeyByZXR1cm4gYSA9PT0gdmFsOyB9KTtcbiAgfVxuXG4gIHZhciBncm91cEFycmF5QnlQcm9wcyA9IGZ1bmN0aW9uKGFyciwgcHJvcHNBcnIpIHtcbiAgICB2YXIgZ3JvdXBzID0ge307XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgICAgdmFyIGdyb3VwID0gSlNPTi5zdHJpbmdpZnkocHJvcHNBcnIubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIG9bcF07IH0pKTtcbiAgICAgIGdyb3Vwc1tncm91cF0gPSBncm91cHNbZ3JvdXBdIHx8IFtdO1xuICAgICAgZ3JvdXBzW2dyb3VwXS5wdXNoKG8pO1xuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhncm91cHMpLm1hcChmdW5jdGlvbihncm91cCkge1xuICAgICAgcmV0dXJuIGdyb3Vwc1tncm91cF07XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmVtb3ZlQXJyYXlEdXBsaWNhdGVzID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24oaXRlbSwgcG9zLCBzZWxmKSB7XG4gICAgICByZXR1cm4gc2VsZi5pbmRleE9mKGl0ZW0pID09PSBwb3M7XG4gICAgfSk7XG4gIH1cblxuICAvLyBPYmplY3RzXG5cbiAgdmFyIGNsb25lT2JqZWN0ID0gZnVuY3Rpb24obykge1xuICAgIHZhciBuZXdPYmplY3QgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIG8pIG5ld09iamVjdFtwXSA9IG9bcF07XG4gICAgcmV0dXJuIG5ld09iamVjdDtcbiAgfVxuXG4gIHZhciBtZXJnZU9iamVjdHMgPSBmdW5jdGlvbihvMSwgbzIpIHtcbiAgICBmb3IgKHZhciBwIGluIG8yKSBvMVtwXSA9ICFpcy51bmQobzFbcF0pID8gbzFbcF0gOiBvMltwXTtcbiAgICByZXR1cm4gbzE7XG4gIH1cblxuICAvLyBDb2xvcnNcblxuICB2YXIgaGV4VG9SZ2IgPSBmdW5jdGlvbihoZXgpIHtcbiAgICB2YXIgcmd4ID0gL14jPyhbYS1mXFxkXSkoW2EtZlxcZF0pKFthLWZcXGRdKSQvaTtcbiAgICB2YXIgaGV4ID0gaGV4LnJlcGxhY2Uocmd4LCBmdW5jdGlvbihtLCByLCBnLCBiKSB7IHJldHVybiByICsgciArIGcgKyBnICsgYiArIGI7IH0pO1xuICAgIHZhciByZ2IgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICB2YXIgciA9IHBhcnNlSW50KHJnYlsxXSwgMTYpO1xuICAgIHZhciBnID0gcGFyc2VJbnQocmdiWzJdLCAxNik7XG4gICAgdmFyIGIgPSBwYXJzZUludChyZ2JbM10sIDE2KTtcbiAgICByZXR1cm4gJ3JnYignICsgciArICcsJyArIGcgKyAnLCcgKyBiICsgJyknO1xuICB9XG5cbiAgdmFyIGhzbFRvUmdiID0gZnVuY3Rpb24oaHNsKSB7XG4gICAgdmFyIGhzbCA9IC9oc2xcXCgoXFxkKyksXFxzKihbXFxkLl0rKSUsXFxzKihbXFxkLl0rKSVcXCkvZy5leGVjKGhzbCk7XG4gICAgdmFyIGggPSBwYXJzZUludChoc2xbMV0pIC8gMzYwO1xuICAgIHZhciBzID0gcGFyc2VJbnQoaHNsWzJdKSAvIDEwMDtcbiAgICB2YXIgbCA9IHBhcnNlSW50KGhzbFszXSkgLyAxMDA7XG4gICAgdmFyIGh1ZTJyZ2IgPSBmdW5jdGlvbihwLCBxLCB0KSB7XG4gICAgICBpZiAodCA8IDApIHQgKz0gMTtcbiAgICAgIGlmICh0ID4gMSkgdCAtPSAxO1xuICAgICAgaWYgKHQgPCAxLzYpIHJldHVybiBwICsgKHEgLSBwKSAqIDYgKiB0O1xuICAgICAgaWYgKHQgPCAxLzIpIHJldHVybiBxO1xuICAgICAgaWYgKHQgPCAyLzMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyLzMgLSB0KSAqIDY7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgdmFyIHIsIGcsIGI7XG4gICAgaWYgKHMgPT0gMCkge1xuICAgICAgciA9IGcgPSBiID0gbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHEgPSBsIDwgMC41ID8gbCAqICgxICsgcykgOiBsICsgcyAtIGwgKiBzO1xuICAgICAgdmFyIHAgPSAyICogbCAtIHE7XG4gICAgICByID0gaHVlMnJnYihwLCBxLCBoICsgMS8zKTtcbiAgICAgIGcgPSBodWUycmdiKHAsIHEsIGgpO1xuICAgICAgYiA9IGh1ZTJyZ2IocCwgcSwgaCAtIDEvMyk7XG4gICAgfVxuICAgIHJldHVybiAncmdiKCcgKyByICogMjU1ICsgJywnICsgZyAqIDI1NSArICcsJyArIGIgKiAyNTUgKyAnKSc7XG4gIH1cblxuICB2YXIgY29sb3JUb1JnYiA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIGlmIChpcy5yZ2IodmFsKSkgcmV0dXJuIHZhbDtcbiAgICBpZiAoaXMuaGV4KHZhbCkpIHJldHVybiBoZXhUb1JnYih2YWwpO1xuICAgIGlmIChpcy5oc2wodmFsKSkgcmV0dXJuIGhzbFRvUmdiKHZhbCk7XG4gIH1cblxuICAvLyBVbml0c1xuXG4gIHZhciBnZXRVbml0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIC8oW1xcK1xcLV0/WzAtOXxhdXRvXFwuXSspKCV8cHh8cHR8ZW18cmVtfGlufGNtfG1tfGV4fHBjfHZ3fHZofGRlZyk/Ly5leGVjKHZhbClbMl07XG4gIH1cblxuICB2YXIgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQgPSBmdW5jdGlvbihwcm9wLCB2YWwsIGludGlhbFZhbCkge1xuICAgIGlmIChnZXRVbml0KHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKHByb3AuaW5kZXhPZigndHJhbnNsYXRlJykgPiAtMSkgcmV0dXJuIGdldFVuaXQoaW50aWFsVmFsKSA/IHZhbCArIGdldFVuaXQoaW50aWFsVmFsKSA6IHZhbCArICdweCc7XG4gICAgaWYgKHByb3AuaW5kZXhPZigncm90YXRlJykgPiAtMSB8fCBwcm9wLmluZGV4T2YoJ3NrZXcnKSA+IC0xKSByZXR1cm4gdmFsICsgJ2RlZyc7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIC8vIFZhbHVlc1xuXG4gIHZhciBnZXRDU1NWYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgcHJvcCBpcyBhIHZhbGlkIENTUyBwcm9wZXJ0eVxuICAgIGlmIChwcm9wIGluIGVsLnN0eWxlKSB7XG4gICAgICAvLyBUaGVuIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb3IgZmFsbGJhY2sgdG8gJzAnIHdoZW4gZ2V0UHJvcGVydHlWYWx1ZSBmYWlsc1xuICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUoc3RyaW5nVG9IeXBoZW5zKHByb3ApKSB8fCAnMCc7XG4gICAgfVxuICB9XG5cbiAgdmFyIGdldFRyYW5zZm9ybVZhbHVlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICB2YXIgZGVmYXVsdFZhbCA9IHByb3AuaW5kZXhPZignc2NhbGUnKSA+IC0xID8gMSA6IDA7XG4gICAgdmFyIHN0ciA9IGVsLnN0eWxlLnRyYW5zZm9ybTtcbiAgICBpZiAoIXN0cikgcmV0dXJuIGRlZmF1bHRWYWw7XG4gICAgdmFyIHJneCA9IC8oXFx3KylcXCgoLis/KVxcKS9nO1xuICAgIHZhciBtYXRjaCA9IFtdO1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICB3aGlsZSAobWF0Y2ggPSByZ3guZXhlYyhzdHIpKSB7XG4gICAgICBwcm9wcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgIHZhbHVlcy5wdXNoKG1hdGNoWzJdKTtcbiAgICB9XG4gICAgdmFyIHZhbCA9IHZhbHVlcy5maWx0ZXIoZnVuY3Rpb24oZiwgaSkgeyByZXR1cm4gcHJvcHNbaV0gPT09IHByb3A7IH0pO1xuICAgIHJldHVybiB2YWwubGVuZ3RoID8gdmFsWzBdIDogZGVmYXVsdFZhbDtcbiAgfVxuXG4gIHZhciBnZXRBbmltYXRpb25UeXBlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgYXJyYXlDb250YWlucyh2YWxpZFRyYW5zZm9ybXMsIHByb3ApKSByZXR1cm4gJ3RyYW5zZm9ybSc7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIChlbC5nZXRBdHRyaWJ1dGUocHJvcCkgfHwgKGlzLnN2ZyhlbCkgJiYgZWxbcHJvcF0pKSkgcmV0dXJuICdhdHRyaWJ1dGUnO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAocHJvcCAhPT0gJ3RyYW5zZm9ybScgJiYgZ2V0Q1NTVmFsdWUoZWwsIHByb3ApKSkgcmV0dXJuICdjc3MnO1xuICAgIGlmICghaXMubnVsKGVsW3Byb3BdKSAmJiAhaXMudW5kKGVsW3Byb3BdKSkgcmV0dXJuICdvYmplY3QnO1xuICB9XG5cbiAgdmFyIGdldEluaXRpYWxUYXJnZXRWYWx1ZSA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCkge1xuICAgIHN3aXRjaCAoZ2V0QW5pbWF0aW9uVHlwZSh0YXJnZXQsIHByb3ApKSB7XG4gICAgICBjYXNlICd0cmFuc2Zvcm0nOiByZXR1cm4gZ2V0VHJhbnNmb3JtVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2Nzcyc6IHJldHVybiBnZXRDU1NWYWx1ZSh0YXJnZXQsIHByb3ApO1xuICAgICAgY2FzZSAnYXR0cmlidXRlJzogcmV0dXJuIHRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRbcHJvcF0gfHwgMDtcbiAgfVxuXG4gIHZhciBnZXRWYWxpZFZhbHVlID0gZnVuY3Rpb24odmFsdWVzLCB2YWwsIG9yaWdpbmFsQ1NTKSB7XG4gICAgaWYgKGlzLmNvbCh2YWwpKSByZXR1cm4gY29sb3JUb1JnYih2YWwpO1xuICAgIGlmIChnZXRVbml0KHZhbCkpIHJldHVybiB2YWw7XG4gICAgdmFyIHVuaXQgPSBnZXRVbml0KHZhbHVlcy50bykgPyBnZXRVbml0KHZhbHVlcy50bykgOiBnZXRVbml0KHZhbHVlcy5mcm9tKTtcbiAgICBpZiAoIXVuaXQgJiYgb3JpZ2luYWxDU1MpIHVuaXQgPSBnZXRVbml0KG9yaWdpbmFsQ1NTKTtcbiAgICByZXR1cm4gdW5pdCA/IHZhbCArIHVuaXQgOiB2YWw7XG4gIH1cblxuICB2YXIgZGVjb21wb3NlVmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgcmd4ID0gLy0/XFxkKlxcLj9cXGQrL2c7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yaWdpbmFsOiB2YWwsXG4gICAgICBudW1iZXJzOiBudW1iZXJUb1N0cmluZyh2YWwpLm1hdGNoKHJneCkgPyBudW1iZXJUb1N0cmluZyh2YWwpLm1hdGNoKHJneCkubWFwKE51bWJlcikgOiBbMF0sXG4gICAgICBzdHJpbmdzOiBudW1iZXJUb1N0cmluZyh2YWwpLnNwbGl0KHJneClcbiAgICB9XG4gIH1cblxuICB2YXIgcmVjb21wb3NlVmFsdWUgPSBmdW5jdGlvbihudW1iZXJzLCBzdHJpbmdzLCBpbml0aWFsU3RyaW5ncykge1xuICAgIHJldHVybiBzdHJpbmdzLnJlZHVjZShmdW5jdGlvbihhLCBiLCBpKSB7XG4gICAgICB2YXIgYiA9IChiID8gYiA6IGluaXRpYWxTdHJpbmdzW2kgLSAxXSk7XG4gICAgICByZXR1cm4gYSArIG51bWJlcnNbaSAtIDFdICsgYjtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEFuaW1hdGFibGVzXG5cbiAgdmFyIGdldEFuaW1hdGFibGVzID0gZnVuY3Rpb24odGFyZ2V0cykge1xuICAgIHZhciB0YXJnZXRzID0gdGFyZ2V0cyA/IChmbGF0dGVuQXJyYXkoaXMuYXJyKHRhcmdldHMpID8gdGFyZ2V0cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KHRhcmdldHMpKSkgOiBbXTtcbiAgICByZXR1cm4gdGFyZ2V0cy5tYXAoZnVuY3Rpb24odCwgaSkge1xuICAgICAgcmV0dXJuIHsgdGFyZ2V0OiB0LCBpZDogaSB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUHJvcGVydGllc1xuXG4gIHZhciBnZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR0aW5ncykge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIGZvciAodmFyIHAgaW4gcGFyYW1zKSB7XG4gICAgICBpZiAoIWRlZmF1bHRTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShwKSAmJiBwICE9PSAndGFyZ2V0cycpIHtcbiAgICAgICAgdmFyIHByb3AgPSBpcy5vYmoocGFyYW1zW3BdKSA/IGNsb25lT2JqZWN0KHBhcmFtc1twXSkgOiB7dmFsdWU6IHBhcmFtc1twXX07XG4gICAgICAgIHByb3AubmFtZSA9IHA7XG4gICAgICAgIHByb3BzLnB1c2gobWVyZ2VPYmplY3RzKHByb3AsIHNldHRpbmdzKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIHZhciBnZXRQcm9wZXJ0aWVzVmFsdWVzID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wLCB2YWx1ZSwgaSkge1xuICAgIHZhciB2YWx1ZXMgPSB0b0FycmF5KCBpcy5mbmModmFsdWUpID8gdmFsdWUodGFyZ2V0LCBpKSA6IHZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgZnJvbTogKHZhbHVlcy5sZW5ndGggPiAxKSA/IHZhbHVlc1swXSA6IGdldEluaXRpYWxUYXJnZXRWYWx1ZSh0YXJnZXQsIHByb3ApLFxuICAgICAgdG86ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMV0gOiB2YWx1ZXNbMF1cbiAgICB9XG4gIH1cblxuICAvLyBUd2VlbnNcblxuICB2YXIgZ2V0VHdlZW5WYWx1ZXMgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZXMsIHR5cGUsIHRhcmdldCkge1xuICAgIHZhciB2YWxpZCA9IHt9O1xuICAgIGlmICh0eXBlID09PSAndHJhbnNmb3JtJykge1xuICAgICAgdmFsaWQuZnJvbSA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMuZnJvbSwgdmFsdWVzLnRvKSArICcpJztcbiAgICAgIHZhbGlkLnRvID0gcHJvcCArICcoJyArIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0KHByb3AsIHZhbHVlcy50bykgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvcmlnaW5hbENTUyA9ICh0eXBlID09PSAnY3NzJykgPyBnZXRDU1NWYWx1ZSh0YXJnZXQsIHByb3ApIDogdW5kZWZpbmVkO1xuICAgICAgdmFsaWQuZnJvbSA9IGdldFZhbGlkVmFsdWUodmFsdWVzLCB2YWx1ZXMuZnJvbSwgb3JpZ2luYWxDU1MpO1xuICAgICAgdmFsaWQudG8gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLnRvLCBvcmlnaW5hbENTUyk7XG4gICAgfVxuICAgIHJldHVybiB7IGZyb206IGRlY29tcG9zZVZhbHVlKHZhbGlkLmZyb20pLCB0bzogZGVjb21wb3NlVmFsdWUodmFsaWQudG8pIH07XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zUHJvcHMgPSBmdW5jdGlvbihhbmltYXRhYmxlcywgcHJvcHMpIHtcbiAgICB2YXIgdHdlZW5zUHJvcHMgPSBbXTtcbiAgICBhbmltYXRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKGFuaW1hdGFibGUsIGkpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBhbmltYXRhYmxlLnRhcmdldDtcbiAgICAgIHJldHVybiBwcm9wcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgdmFyIGFuaW1UeXBlID0gZ2V0QW5pbWF0aW9uVHlwZSh0YXJnZXQsIHByb3AubmFtZSk7XG4gICAgICAgIGlmIChhbmltVHlwZSkge1xuICAgICAgICAgIHZhciB2YWx1ZXMgPSBnZXRQcm9wZXJ0aWVzVmFsdWVzKHRhcmdldCwgcHJvcC5uYW1lLCBwcm9wLnZhbHVlLCBpKTtcbiAgICAgICAgICB2YXIgdHdlZW4gPSBjbG9uZU9iamVjdChwcm9wKTtcbiAgICAgICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IGFuaW1hdGFibGU7XG4gICAgICAgICAgdHdlZW4udHlwZSA9IGFuaW1UeXBlO1xuICAgICAgICAgIHR3ZWVuLmZyb20gPSBnZXRUd2VlblZhbHVlcyhwcm9wLm5hbWUsIHZhbHVlcywgdHdlZW4udHlwZSwgdGFyZ2V0KS5mcm9tO1xuICAgICAgICAgIHR3ZWVuLnRvID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkudG87XG4gICAgICAgICAgdHdlZW4ucm91bmQgPSAoaXMuY29sKHZhbHVlcy5mcm9tKSB8fCB0d2Vlbi5yb3VuZCkgPyAxIDogMDtcbiAgICAgICAgICB0d2Vlbi5kZWxheSA9IChpcy5mbmModHdlZW4uZGVsYXkpID8gdHdlZW4uZGVsYXkodGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZGVsYXkpIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuLmR1cmF0aW9uID0gKGlzLmZuYyh0d2Vlbi5kdXJhdGlvbikgPyB0d2Vlbi5kdXJhdGlvbih0YXJnZXQsIGksIGFuaW1hdGFibGVzLmxlbmd0aCkgOiB0d2Vlbi5kdXJhdGlvbikgLyBhbmltYXRpb24uc3BlZWQ7XG4gICAgICAgICAgdHdlZW5zUHJvcHMucHVzaCh0d2Vlbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0d2VlbnNQcm9wcztcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnMgPSBmdW5jdGlvbihhbmltYXRhYmxlcywgcHJvcHMpIHtcbiAgICB2YXIgdHdlZW5zUHJvcHMgPSBnZXRUd2VlbnNQcm9wcyhhbmltYXRhYmxlcywgcHJvcHMpO1xuICAgIHZhciBzcGxpdHRlZFByb3BzID0gZ3JvdXBBcnJheUJ5UHJvcHModHdlZW5zUHJvcHMsIFsnbmFtZScsICdmcm9tJywgJ3RvJywgJ2RlbGF5JywgJ2R1cmF0aW9uJ10pO1xuICAgIHJldHVybiBzcGxpdHRlZFByb3BzLm1hcChmdW5jdGlvbih0d2VlblByb3BzKSB7XG4gICAgICB2YXIgdHdlZW4gPSBjbG9uZU9iamVjdCh0d2VlblByb3BzWzBdKTtcbiAgICAgIHR3ZWVuLmFuaW1hdGFibGVzID0gdHdlZW5Qcm9wcy5tYXAoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5hbmltYXRhYmxlcyB9KTtcbiAgICAgIHR3ZWVuLnRvdGFsRHVyYXRpb24gPSB0d2Vlbi5kZWxheSArIHR3ZWVuLmR1cmF0aW9uO1xuICAgICAgcmV0dXJuIHR3ZWVuO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJldmVyc2VUd2VlbnMgPSBmdW5jdGlvbihhbmltLCBkZWxheXMpIHtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICB2YXIgdG9WYWwgPSB0d2Vlbi50bztcbiAgICAgIHZhciBmcm9tVmFsID0gdHdlZW4uZnJvbTtcbiAgICAgIHZhciBkZWxheVZhbCA9IGFuaW0uZHVyYXRpb24gLSAodHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbik7XG4gICAgICB0d2Vlbi5mcm9tID0gdG9WYWw7XG4gICAgICB0d2Vlbi50byA9IGZyb21WYWw7XG4gICAgICBpZiAoZGVsYXlzKSB0d2Vlbi5kZWxheSA9IGRlbGF5VmFsO1xuICAgIH0pO1xuICAgIGFuaW0ucmV2ZXJzZWQgPSBhbmltLnJldmVyc2VkID8gZmFsc2UgOiB0cnVlO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc0R1cmF0aW9uID0gZnVuY3Rpb24odHdlZW5zKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIHR3ZWVucy5tYXAoZnVuY3Rpb24odHdlZW4peyByZXR1cm4gdHdlZW4udG90YWxEdXJhdGlvbjsgfSkpO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc0RlbGF5ID0gZnVuY3Rpb24odHdlZW5zKSB7XG4gICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIHR3ZWVucy5tYXAoZnVuY3Rpb24odHdlZW4peyByZXR1cm4gdHdlZW4uZGVsYXk7IH0pKTtcbiAgfVxuXG4gIC8vIHdpbGwtY2hhbmdlXG5cbiAgdmFyIGdldFdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgdmFyIGVscyA9IFtdO1xuICAgIGFuaW0udHdlZW5zLmZvckVhY2goZnVuY3Rpb24odHdlZW4pIHtcbiAgICAgIGlmICh0d2Vlbi50eXBlID09PSAnY3NzJyB8fCB0d2Vlbi50eXBlID09PSAndHJhbnNmb3JtJyApIHtcbiAgICAgICAgcHJvcHMucHVzaCh0d2Vlbi50eXBlID09PSAnY3NzJyA/IHN0cmluZ1RvSHlwaGVucyh0d2Vlbi5uYW1lKSA6ICd0cmFuc2Zvcm0nKTtcbiAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlKSB7IGVscy5wdXNoKGFuaW1hdGFibGUudGFyZ2V0KTsgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3BlcnRpZXM6IHJlbW92ZUFycmF5RHVwbGljYXRlcyhwcm9wcykuam9pbignLCAnKSxcbiAgICAgIGVsZW1lbnRzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMoZWxzKVxuICAgIH1cbiAgfVxuXG4gIHZhciBzZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS53aWxsQ2hhbmdlID0gd2lsbENoYW5nZS5wcm9wZXJ0aWVzO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZVdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHdpbGxDaGFuZ2UgPSBnZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgIHdpbGxDaGFuZ2UuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KCd3aWxsLWNoYW5nZScpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogU3ZnIHBhdGggKi9cblxuICB2YXIgZ2V0UGF0aFByb3BzID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIHZhciBlbCA9IGlzLnN0cihwYXRoKSA/IHNlbGVjdFN0cmluZyhwYXRoKVswXSA6IHBhdGg7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGg6IGVsLFxuICAgICAgdmFsdWU6IGVsLmdldFRvdGFsTGVuZ3RoKClcbiAgICB9XG4gIH1cblxuICB2YXIgc25hcFByb2dyZXNzVG9QYXRoID0gZnVuY3Rpb24odHdlZW4sIHByb2dyZXNzKSB7XG4gICAgdmFyIHBhdGhFbCA9IHR3ZWVuLnBhdGg7XG4gICAgdmFyIHBhdGhQcm9ncmVzcyA9IHR3ZWVuLnZhbHVlICogcHJvZ3Jlc3M7XG4gICAgdmFyIHBvaW50ID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgICB2YXIgbyA9IG9mZnNldCB8fCAwO1xuICAgICAgdmFyIHAgPSBwcm9ncmVzcyA+IDEgPyB0d2Vlbi52YWx1ZSArIG8gOiBwYXRoUHJvZ3Jlc3MgKyBvO1xuICAgICAgcmV0dXJuIHBhdGhFbC5nZXRQb2ludEF0TGVuZ3RoKHApO1xuICAgIH1cbiAgICB2YXIgcCA9IHBvaW50KCk7XG4gICAgdmFyIHAwID0gcG9pbnQoLTEpO1xuICAgIHZhciBwMSA9IHBvaW50KCsxKTtcbiAgICBzd2l0Y2ggKHR3ZWVuLm5hbWUpIHtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVgnOiByZXR1cm4gcC54O1xuICAgICAgY2FzZSAndHJhbnNsYXRlWSc6IHJldHVybiBwLnk7XG4gICAgICBjYXNlICdyb3RhdGUnOiByZXR1cm4gTWF0aC5hdGFuMihwMS55IC0gcDAueSwgcDEueCAtIHAwLngpICogMTgwIC8gTWF0aC5QSTtcbiAgICB9XG4gIH1cblxuICAvLyBQcm9ncmVzc1xuXG4gIHZhciBnZXRUd2VlblByb2dyZXNzID0gZnVuY3Rpb24odHdlZW4sIHRpbWUpIHtcbiAgICB2YXIgZWxhcHNlZCA9IE1hdGgubWluKE1hdGgubWF4KHRpbWUgLSB0d2Vlbi5kZWxheSwgMCksIHR3ZWVuLmR1cmF0aW9uKTtcbiAgICB2YXIgcGVyY2VudCA9IGVsYXBzZWQgLyB0d2Vlbi5kdXJhdGlvbjtcbiAgICB2YXIgcHJvZ3Jlc3MgPSB0d2Vlbi50by5udW1iZXJzLm1hcChmdW5jdGlvbihudW1iZXIsIHApIHtcbiAgICAgIHZhciBzdGFydCA9IHR3ZWVuLmZyb20ubnVtYmVyc1twXTtcbiAgICAgIHZhciBlYXNlZCA9IGVhc2luZ3NbdHdlZW4uZWFzaW5nXShwZXJjZW50LCB0d2Vlbi5lbGFzdGljaXR5KTtcbiAgICAgIHZhciB2YWwgPSB0d2Vlbi5wYXRoID8gc25hcFByb2dyZXNzVG9QYXRoKHR3ZWVuLCBlYXNlZCkgOiBzdGFydCArIGVhc2VkICogKG51bWJlciAtIHN0YXJ0KTtcbiAgICAgIHZhbCA9IHR3ZWVuLnJvdW5kID8gTWF0aC5yb3VuZCh2YWwgKiB0d2Vlbi5yb3VuZCkgLyB0d2Vlbi5yb3VuZCA6IHZhbDtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlY29tcG9zZVZhbHVlKHByb2dyZXNzLCB0d2Vlbi50by5zdHJpbmdzLCB0d2Vlbi5mcm9tLnN0cmluZ3MpO1xuICB9XG5cbiAgdmFyIHNldEFuaW1hdGlvblByb2dyZXNzID0gZnVuY3Rpb24oYW5pbSwgdGltZSkge1xuICAgIHZhciB0cmFuc2Zvcm1zO1xuICAgIGFuaW0uY3VycmVudFRpbWUgPSB0aW1lO1xuICAgIGFuaW0ucHJvZ3Jlc3MgPSAodGltZSAvIGFuaW0uZHVyYXRpb24pICogMTAwO1xuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgYW5pbS50d2VlbnMubGVuZ3RoOyB0KyspIHtcbiAgICAgIHZhciB0d2VlbiA9IGFuaW0udHdlZW5zW3RdO1xuICAgICAgdHdlZW4uY3VycmVudFZhbHVlID0gZ2V0VHdlZW5Qcm9ncmVzcyh0d2VlbiwgdGltZSk7XG4gICAgICB2YXIgcHJvZ3Jlc3MgPSB0d2Vlbi5jdXJyZW50VmFsdWU7XG4gICAgICBmb3IgKHZhciBhID0gMDsgYSA8IHR3ZWVuLmFuaW1hdGFibGVzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhbmltYXRhYmxlID0gdHdlZW4uYW5pbWF0YWJsZXNbYV07XG4gICAgICAgIHZhciBpZCA9IGFuaW1hdGFibGUuaWQ7XG4gICAgICAgIHZhciB0YXJnZXQgPSBhbmltYXRhYmxlLnRhcmdldDtcbiAgICAgICAgdmFyIG5hbWUgPSB0d2Vlbi5uYW1lO1xuICAgICAgICBzd2l0Y2ggKHR3ZWVuLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdjc3MnOiB0YXJnZXQuc3R5bGVbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYXR0cmlidXRlJzogdGFyZ2V0LnNldEF0dHJpYnV0ZShuYW1lLCBwcm9ncmVzcyk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ29iamVjdCc6IHRhcmdldFtuYW1lXSA9IHByb2dyZXNzOyBicmVhaztcbiAgICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghdHJhbnNmb3JtcykgdHJhbnNmb3JtcyA9IHt9O1xuICAgICAgICAgIGlmICghdHJhbnNmb3Jtc1tpZF0pIHRyYW5zZm9ybXNbaWRdID0gW107XG4gICAgICAgICAgdHJhbnNmb3Jtc1tpZF0ucHVzaChwcm9ncmVzcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRyYW5zZm9ybXMpIHtcbiAgICAgIGlmICghdHJhbnNmb3JtKSB0cmFuc2Zvcm0gPSAoZ2V0Q1NTVmFsdWUoZG9jdW1lbnQuYm9keSwgdHJhbnNmb3JtU3RyKSA/ICcnIDogJy13ZWJraXQtJykgKyB0cmFuc2Zvcm1TdHI7XG4gICAgICBmb3IgKHZhciB0IGluIHRyYW5zZm9ybXMpIHtcbiAgICAgICAgYW5pbS5hbmltYXRhYmxlc1t0XS50YXJnZXQuc3R5bGVbdHJhbnNmb3JtXSA9IHRyYW5zZm9ybXNbdF0uam9pbignICcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFuaW1hdGlvblxuXG4gIHZhciBjcmVhdGVBbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgYW5pbSA9IHt9O1xuICAgIGFuaW0uYW5pbWF0YWJsZXMgPSBnZXRBbmltYXRhYmxlcyhwYXJhbXMudGFyZ2V0cyk7XG4gICAgYW5pbS5zZXR0aW5ncyA9IG1lcmdlT2JqZWN0cyhwYXJhbXMsIGRlZmF1bHRTZXR0aW5ncyk7XG4gICAgYW5pbS5wcm9wZXJ0aWVzID0gZ2V0UHJvcGVydGllcyhwYXJhbXMsIGFuaW0uc2V0dGluZ3MpO1xuICAgIGFuaW0udHdlZW5zID0gZ2V0VHdlZW5zKGFuaW0uYW5pbWF0YWJsZXMsIGFuaW0ucHJvcGVydGllcyk7XG4gICAgYW5pbS5kdXJhdGlvbiA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0R1cmF0aW9uKGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kdXJhdGlvbjtcbiAgICBhbmltLmRlbGF5ID0gYW5pbS50d2VlbnMubGVuZ3RoID8gZ2V0VHdlZW5zRGVsYXkoYW5pbS50d2VlbnMpIDogcGFyYW1zLmRlbGF5O1xuICAgIGFuaW0uY3VycmVudFRpbWUgPSAwO1xuICAgIGFuaW0ucHJvZ3Jlc3MgPSAwO1xuICAgIGFuaW0uZW5kZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gYW5pbTtcbiAgfVxuXG4gIC8vIFB1YmxpY1xuXG4gIHZhciBhbmltYXRpb25zID0gW107XG4gIHZhciByYWYgPSAwO1xuXG4gIHZhciBlbmdpbmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBsYXkgPSBmdW5jdGlvbigpIHsgcmFmID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApOyB9O1xuICAgIHZhciBzdGVwID0gZnVuY3Rpb24odCkge1xuICAgICAgaWYgKGFuaW1hdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9ucy5sZW5ndGg7IGkrKykgYW5pbWF0aW9uc1tpXS50aWNrKHQpO1xuICAgICAgICBwbGF5KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyYWYpO1xuICAgICAgICByYWYgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGxheTtcbiAgfSkoKTtcblxuICB2YXIgYW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG5cbiAgICB2YXIgYW5pbSA9IGNyZWF0ZUFuaW1hdGlvbihwYXJhbXMpO1xuICAgIHZhciB0aW1lID0ge307XG5cbiAgICBhbmltLnRpY2sgPSBmdW5jdGlvbihub3cpIHtcbiAgICAgIGFuaW0uZW5kZWQgPSBmYWxzZTtcbiAgICAgIGlmICghdGltZS5zdGFydCkgdGltZS5zdGFydCA9IG5vdztcbiAgICAgIHRpbWUuY3VycmVudCA9IE1hdGgubWluKE1hdGgubWF4KHRpbWUubGFzdCArIG5vdyAtIHRpbWUuc3RhcnQsIDApLCBhbmltLmR1cmF0aW9uKTtcbiAgICAgIHNldEFuaW1hdGlvblByb2dyZXNzKGFuaW0sIHRpbWUuY3VycmVudCk7XG4gICAgICB2YXIgcyA9IGFuaW0uc2V0dGluZ3M7XG4gICAgICBpZiAodGltZS5jdXJyZW50ID49IGFuaW0uZGVsYXkpIHtcbiAgICAgICAgaWYgKHMuYmVnaW4pIHMuYmVnaW4oYW5pbSk7IHMuYmVnaW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzLnVwZGF0ZSkgcy51cGRhdGUoYW5pbSk7XG4gICAgICB9XG4gICAgICBpZiAodGltZS5jdXJyZW50ID49IGFuaW0uZHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHMubG9vcCkge1xuICAgICAgICAgIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJykgcmV2ZXJzZVR3ZWVucyhhbmltLCB0cnVlKTtcbiAgICAgICAgICBpZiAoaXMubnVtKHMubG9vcCkpIHMubG9vcC0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuaW0uZW5kZWQgPSB0cnVlO1xuICAgICAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgICAgICBpZiAocy5jb21wbGV0ZSkgcy5jb21wbGV0ZShhbmltKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lLmxhc3QgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFuaW0uc2VlayA9IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCAocHJvZ3Jlc3MgLyAxMDApICogYW5pbS5kdXJhdGlvbik7XG4gICAgfVxuXG4gICAgYW5pbS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3ZlV2lsbENoYW5nZShhbmltKTtcbiAgICAgIHZhciBpID0gYW5pbWF0aW9ucy5pbmRleE9mKGFuaW0pO1xuICAgICAgaWYgKGkgPiAtMSkgYW5pbWF0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuXG4gICAgYW5pbS5wbGF5ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBpZiAocGFyYW1zKSBhbmltID0gbWVyZ2VPYmplY3RzKGNyZWF0ZUFuaW1hdGlvbihtZXJnZU9iamVjdHMocGFyYW1zLCBhbmltLnNldHRpbmdzKSksIGFuaW0pO1xuICAgICAgdGltZS5zdGFydCA9IDA7XG4gICAgICB0aW1lLmxhc3QgPSBhbmltLmVuZGVkID8gMCA6IGFuaW0uY3VycmVudFRpbWU7XG4gICAgICB2YXIgcyA9IGFuaW0uc2V0dGluZ3M7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdyZXZlcnNlJykgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScgJiYgIXMubG9vcCkgcy5sb29wID0gMTtcbiAgICAgIHNldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICBhbmltYXRpb25zLnB1c2goYW5pbSk7XG4gICAgICBpZiAoIXJhZikgZW5naW5lKCk7XG4gICAgfVxuXG4gICAgYW5pbS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYW5pbS5yZXZlcnNlZCkgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgIGFuaW0uc2VlaygwKTtcbiAgICAgIGFuaW0ucGxheSgpO1xuICAgIH1cblxuICAgIGlmIChhbmltLnNldHRpbmdzLmF1dG9wbGF5KSBhbmltLnBsYXkoKTtcblxuICAgIHJldHVybiBhbmltO1xuXG4gIH1cblxuICAvLyBSZW1vdmUgb25lIG9yIG11bHRpcGxlIHRhcmdldHMgZnJvbSBhbGwgYWN0aXZlIGFuaW1hdGlvbnMuXG5cbiAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgdmFyIHRhcmdldHMgPSBmbGF0dGVuQXJyYXkoaXMuYXJyKGVsZW1lbnRzKSA/IGVsZW1lbnRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkoZWxlbWVudHMpKTtcbiAgICBmb3IgKHZhciBpID0gYW5pbWF0aW9ucy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBhbmltYXRpb24gPSBhbmltYXRpb25zW2ldO1xuICAgICAgdmFyIHR3ZWVucyA9IGFuaW1hdGlvbi50d2VlbnM7XG4gICAgICBmb3IgKHZhciB0ID0gdHdlZW5zLmxlbmd0aC0xOyB0ID49IDA7IHQtLSkge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZXMgPSB0d2VlbnNbdF0uYW5pbWF0YWJsZXM7XG4gICAgICAgIGZvciAodmFyIGEgPSBhbmltYXRhYmxlcy5sZW5ndGgtMTsgYSA+PSAwOyBhLS0pIHtcbiAgICAgICAgICBpZiAoYXJyYXlDb250YWlucyh0YXJnZXRzLCBhbmltYXRhYmxlc1thXS50YXJnZXQpKSB7XG4gICAgICAgICAgICBhbmltYXRhYmxlcy5zcGxpY2UoYSwgMSk7XG4gICAgICAgICAgICBpZiAoIWFuaW1hdGFibGVzLmxlbmd0aCkgdHdlZW5zLnNwbGljZSh0LCAxKTtcbiAgICAgICAgICAgIGlmICghdHdlZW5zLmxlbmd0aCkgYW5pbWF0aW9uLnBhdXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0aW9uLnZlcnNpb24gPSB2ZXJzaW9uO1xuICBhbmltYXRpb24uc3BlZWQgPSAxO1xuICBhbmltYXRpb24ubGlzdCA9IGFuaW1hdGlvbnM7XG4gIGFuaW1hdGlvbi5yZW1vdmUgPSByZW1vdmU7XG4gIGFuaW1hdGlvbi5lYXNpbmdzID0gZWFzaW5ncztcbiAgYW5pbWF0aW9uLmdldFZhbHVlID0gZ2V0SW5pdGlhbFRhcmdldFZhbHVlO1xuICBhbmltYXRpb24ucGF0aCA9IGdldFBhdGhQcm9wcztcbiAgYW5pbWF0aW9uLnJhbmRvbSA9IHJhbmRvbTtcblxuICByZXR1cm4gYW5pbWF0aW9uO1xuXG59KSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYW5pbWVqcy9hbmltZS5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblwidXNlIHN0cmljdFwiO1xuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHYW1lIGxvZ2ljIGZvciBjb250cm9sbGluZyBhLWZyYW1lIGFjdGlvbnMgc3VjaCBhcyB0ZWxlcG9ydCBhbmQgc2F2ZVxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhY3Rpb24tY29udHJvbHMnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBtZW51SUQ6IHt0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcIm1lbnVcIn1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgaWYgY29tcG9uZW50IG5lZWRzIG11bHRpcGxlIGluc3RhbmNpbmcuXHJcbiAgICovXHJcbiAgbXVsdGlwbGU6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBnZXQgbWVudSBlbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGVzZSBjb250cm9sc1xyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbkFjdGlvbkNoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uQWN0aW9uU2VsZWN0LmJpbmQodGhpcykpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25BY3Rpb25DaGFuZ2UpO1xyXG4gICAgLy8gbWVudUVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdCk7XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJhY3Rpb24tY29udHJvbHM6IG1lbnUgZWxlbWVudDogXCIgKyBtZW51RWwpO1xyXG4gICAgLy8gZ2V0IGN1cnJlbnRseSBzZWxlY3RlZCBhY3Rpb25cclxuICAgIHZhciBvcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgIGNvbnNvbGUubG9nKFwib3B0aW9uVmFsdWVcIiArIG9wdGlvblZhbHVlKTtcclxuICAgIGNvbnNvbGUubG9nKG9wdGlvblZhbHVlKTtcclxuXHJcbiAgICAvLyBkbyB0aGUgdGhpbmcgYXNzb2NpYXRlZCB3aXRoIHRoZSBhY3Rpb25cclxuICAgIHRoaXMuaGFuZGxlQWN0aW9uU3RhcnQob3B0aW9uVmFsdWUpO1xyXG4gIH0sXHJcblxyXG4gIG9uQWN0aW9uU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyB3aGF0IGlzIHRoZSBhY3Rpb25cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuXHJcbiAgICAvLyBnZXQgY3VycmVudGx5IHNlbGVjdGVkIGFjdGlvblxyXG4gICAgdmFyIG9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG4gICAgY29uc29sZS5sb2coXCJvbkFjdGlvblNlbGVjdCB0cmlnZ2VyZWRcXG5jdXJyZW50IG9wdGlvblZhbHVlOlxcblwiKTtcclxuICAgIGNvbnNvbGUubG9nKG9wdGlvblZhbHVlKTtcclxuICAgIC8vIGNhbGwgdGhlIHRoaW5nIHRoYXQgZG9lcyBpdFxyXG4gIH0sXHJcblxyXG4gIG9uQWN0aW9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyB1bmRvIG9sZCBvbmVcclxuICAgIHRoaXMuaGFuZGxlQWN0aW9uRW5kKHRoaXMucHJldmlvdXNBY3Rpb24pO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuICAgIC8vIGdldCBjdXJyZW50bHkgc2VsZWN0ZWQgYWN0aW9uXHJcbiAgICB2YXIgb3B0aW9uVmFsdWUgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcbiAgICBjb25zb2xlLmxvZyhcIm5ldyBvcHRpb25WYWx1ZTogXCIgKyBvcHRpb25WYWx1ZSk7XHJcbiAgICBjb25zb2xlLmxvZyhvcHRpb25WYWx1ZSk7XHJcbiAgICAvLyBkbyBuZXcgb25lXHJcbiAgICB0aGlzLmhhbmRsZUFjdGlvblN0YXJ0KG9wdGlvblZhbHVlKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgaGFuZGxlQWN0aW9uU3RhcnQ6IGZ1bmN0aW9uKG9wdGlvblZhbHVlKSB7XHJcbiAgICB0aGlzLnByZXZpb3VzQWN0aW9uID0gb3B0aW9uVmFsdWU7XHJcblxyXG4gICAgLy8gZm9yIGdpdmVuIG9wdGlvblZhbHVlLCBkbyBzb21ldGhpbmdcclxuICAgIHN3aXRjaCAob3B0aW9uVmFsdWUpIHtcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6ICAgICAgICAvLyBhZGQgdGVsZXBvcnQgY29tcG9uZW50IHRvIHRoZSBjb250cm9sIGVsZW1lbnQgdGhhdCBpcyB0aGUgcGFyZW50IG9mIHRoaXMgbWVudVxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGVsZXBvcnRTdGFydFwiKTtcclxuICAgICAgICB2YXIgY29udHJvbEVsID0gdGhpcy5lbDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNvbnRyb2xFbDpcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29udHJvbEVsKTtcclxuICAgICAgICAvLyBBZGQgYXR0cmlidXRlIGZyb20gdGhpcyBodG1sOiB0ZWxlcG9ydC1jb250cm9scz1cImJ1dHRvbjogdHJpZ2dlcjsgY29sbGlzaW9uRW50aXRpZXM6ICNncm91bmRcIlxyXG4gICAgICAgIGNvbnRyb2xFbC5zZXRBdHRyaWJ1dGUoXCJ0ZWxlcG9ydC1jb250cm9sc1wiLCBcImJ1dHRvbjogdHJpZ2dlcjsgY29sbGlzaW9uRW50aXRpZXM6ICNncm91bmRcIik7XHJcbiAgICAgICAgcmV0dXJuOyAvLyB3aXRob3V0IHRoaXMgcmV0dXJuIHRoZSBvdGhlciBjYXNlcyBhcmUgZmlyZWQgLSB3ZWlyZCFcclxuICAgICAgY2FzZSBcInNhdmVcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmVTdGFydFwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJzYXZlQXNcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmVBc1N0YXJ0XCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgY2FzZSBcIm5ld1wiOlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibmV3U3RhcnRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGhhbmRsZUFjdGlvbkVuZDogZnVuY3Rpb24ob3B0aW9uVmFsdWUpIHtcclxuICAgIC8vIGZvciBnaXZlbiBvcHRpb25WYWx1ZSwgZG8gc29tZXRoaW5nXHJcbiAgICBzd2l0Y2ggKG9wdGlvblZhbHVlKSB7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOiAgICAgICAgLy8gYWRkIHRlbGVwb3J0IGNvbXBvbmVudCB0byB0aGUgY29udHJvbCBlbGVtZW50IHRoYXQgaXMgdGhlIHBhcmVudCBvZiB0aGlzIG1lbnVcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRlbGVwb3J0RW5kXCIpO1xyXG4gICAgICAgIHZhciBjb250cm9sRWwgPSB0aGlzLmVsO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiY29udHJvbEVsOlwiKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb250cm9sRWwpO1xyXG4gICAgICAgIC8vIEFkZCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGh0bWw6IHRlbGVwb3J0LWNvbnRyb2xzPVwiYnV0dG9uOiB0cmlnZ2VyOyBjb2xsaXNpb25FbnRpdGllczogI2dyb3VuZFwiXHJcbiAgICAgICAgY29udHJvbEVsLnJlbW92ZUF0dHJpYnV0ZShcInRlbGVwb3J0LWNvbnRyb2xzXCIpO1xyXG4gICAgICAgIHJldHVybjsgLy8gd2l0aG91dCB0aGlzIHJldHVybiB0aGUgb3RoZXIgY2FzZXMgYXJlIGZpcmVkIC0gd2VpcmQhXHJcbiAgICAgIGNhc2UgXCJzYXZlXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlU3RhcnRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwic2F2ZUFzXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlQXNTdGFydFwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJuZXdcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm5ld1N0YXJ0XCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYWN0aW9uLWNvbnRyb2xzLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5cclxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcclxufVxyXG5cclxudmFyIG9iamVjdENvdW50ID0gMDsgLy8gc2NlbmUgc3RhcnRzIHdpdGggMCBpdGVtc1xyXG5cclxuZnVuY3Rpb24gaHVtYW5pemUoc3RyKSB7XHJcbiAgdmFyIGZyYWdzID0gc3RyLnNwbGl0KCdfJyk7XHJcbiAgdmFyIGk9MDtcclxuICBmb3IgKGk9MDsgaTxmcmFncy5sZW5ndGg7IGkrKykge1xyXG4gICAgZnJhZ3NbaV0gPSBmcmFnc1tpXS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGZyYWdzW2ldLnNsaWNlKDEpO1xyXG4gIH1cclxuICByZXR1cm4gZnJhZ3Muam9pbignICcpO1xyXG59XHJcblxyXG4vKipcclxuICogVml2ZSBDb250cm9sbGVyIFRlbXBsYXRlIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cclxuICogTW9kaWZlZCBmcm9tIEEtRnJhbWUgRG9taW5vZXMuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2J1aWxkZXItY29udHJvbHMnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBtZW51SWQ6IHt0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcIm1lbnVcIn1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgaWYgY29tcG9uZW50IG5lZWRzIG11bHRpcGxlIGluc3RhbmNpbmcuXHJcbiAgICovXHJcbiAgbXVsdGlwbGU6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgLy8gdGhpcyBpcyB0aGUgb25seSBjb250cm9sbGVyIGZ1bnRpb24gbm90IGNvdmVyZWQgYnkgc2VsZWN0IG1lbnUgY29tcG9uZW50XHJcbiAgICAvLyBBcHBsaWNhYmxlIHRvIGJvdGggVml2ZSBhbmQgT2N1bHVzIFRvdWNoIGNvbnRyb2xzXHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIHRoZSByZXN0IG9mIHRoZSBjb250cm9scyBhcmUgaGFuZGxlZCBieSB0aGUgbWVudSBlbGVtZW50XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcbiAgICBtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uT2JqZWN0Q2hhbmdlLmJpbmQodGhpcykpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8pO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25PYmplY3RDaGFuZ2UpO1xyXG4gICAgbWVudUVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdCk7XHJcblxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9iamVjdCBncm91cCBqc29uIGRpcmVjdG9yaWVzIC0gd2hpY2gganNvbiBmaWxlcyBzaG91bGQgd2UgcmVhZD9cclxuICAgICAgLy8gZm9yIGVhY2ggZ3JvdXAsIGZldGNoIHRoZSBqc29uIGZpbGUgYW5kIHBvcHVsYXRlIHRoZSBvcHRncm91cCBhbmQgb3B0aW9uIGVsZW1lbnRzIGFzIGNoaWxkcmVuIG9mIHRoZSBhcHByb3ByaWF0ZSBtZW51IGVsZW1lbnRcclxuICAgICAgdmFyIGxpc3QgPSBbXCJrZmFycl9iYXNlc1wiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV92ZWhcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYmxkXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX2NoclwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9hbGllblwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9zY2VuZVwiXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICB2YXIgZ3JvdXBKU09OQXJyYXkgPSBbXTtcclxuICAgICAgY29uc3QgbWVudUlkID0gdGhpcy5kYXRhLm1lbnVJZDtcclxuICAgICAgY29uc29sZS5sb2coXCJidWlsZGVyLWNvbnRyb2xzIG1lbnVJZDogXCIgKyBtZW51SWQpO1xyXG5cclxuICAgICAgLy8gVE9ETzogd3JhcCB0aGlzIGluIHByb21pc2UgYW5kIHRoZW4gcmVxdWVzdCBhZnJhbWUtc2VsZWN0LWJhciBjb21wb25lbnQgdG8gcmUtaW5pdCB3aGVuIGRvbmUgbG9hZGluZ1xyXG4gICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGdyb3VwTmFtZSwgaW5kZXgpIHtcclxuICAgICAgICAvLyBleGNlbGxlbnQgcmVmZXJlbmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvT2JqZWN0cy9KU09OXHJcbiAgICAgICAgdmFyIHJlcXVlc3RVUkwgPSAnYXNzZXRzLycgKyBncm91cE5hbWUgKyBcIi5qc29uXCI7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHJlcXVlc3RVUkwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBmb3IgZWFjaCBncm91cGxpc3QganNvbiBmaWxlIHdoZW4gbG9hZGVkXHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgIC8vIGxpdGVyYWxseSBhZGQgdGhpcyBzaGl0IHRvIHRoZSBkb20gZHVkZVxyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImdyb3VwTmFtZTogXCIgKyBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGZpbmQgdGhlIG9wdGdyb3VwIHBhcmVudCBlbGVtZW50IC0gdGhlIG1lbnUgb3B0aW9uP1xyXG4gICAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG1lbnVJZCk7XHJcblxyXG4gICAgICAgICAgLy8gYWRkIHRoZSBwYXJlbnQgb3B0Z3JvdXAgbm9kZSBsaWtlOiA8b3B0Z3JvdXAgbGFiZWw9XCJBbGllbnNcIiB2YWx1ZT1cIm1tbW1fYWxpZW5cIj5cclxuICAgICAgICAgIHZhciBuZXdPcHRncm91cEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGdyb3VwXCIpO1xyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5zZXRBdHRyaWJ1dGUoXCJsYWJlbFwiLCBodW1hbml6ZShncm91cE5hbWUpKTsgLy8gVE9ETzogdGhpcyBzaG91bGQgYmUgYSBwcmV0dGllciBsYWJlbCwgbm90IHRoZSBmaWxlbmFtZVxyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLCBncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgIC8vIGNyZWF0ZSBlYWNoIGNoaWxkXHJcbiAgICAgICAgICB2YXIgb3B0aW9uc0hUTUwgPSBcIlwiO1xyXG4gICAgICAgICAgZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXS5mb3JFYWNoKCBmdW5jdGlvbihvYmplY3REZWZpbml0aW9uLCBpbmRleCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb24pO1xyXG4gICAgICAgICAgICBvcHRpb25zSFRNTCArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7b2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl19XCIgc3JjPVwiYXNzZXRzL3ByZXZpZXcvJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX0uanBnXCI+JHtodW1hbml6ZShvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXSl9PC9vcHRpb24+YFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgbmV3T3B0Z3JvdXBFbC5pbm5lckhUTUwgPSBvcHRpb25zSFRNTDtcclxuICAgICAgICAgIC8vIFRPRE86IEJBRCBXT1JLQVJPVU5EIFRPIE5PVCBSRUxPQUQgQkFTRVMgc2luY2UgaXQncyBkZWZpbmVkIGluIEhUTUwuIEluc3RlYWQsIG5vIG9iamVjdHMgc2hvdWxkIGJlIGxpc3RlZCBpbiBIVE1MLiBUaGlzIHNob3VsZCB1c2UgYSBwcm9taXNlIGFuZCB0aGVuIGluaXQgdGhlIHNlbGVjdC1iYXIgY29tcG9uZW50IG9uY2UgYWxsIG9iamVjdHMgYXJlIGxpc3RlZC5cclxuICAgICAgICAgIGlmIChncm91cE5hbWUgPT0gXCJrZmFycl9iYXNlc1wiKSB7XHJcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmcgLSBkb24ndCBhcHBlbmQgdGhpcyB0byB0aGUgRE9NIGJlY2F1c2Ugb25lIGlzIGFscmVhZHkgdGhlcmVcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1lbnVFbC5hcHBlbmRDaGlsZChuZXdPcHRncm91cEVsKTtcclxuICAgICAgICAgIH1cclxuLy8gICAgICAgICAgcmVzb2x2ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5ncm91cEpTT05BcnJheSA9IGdyb3VwSlNPTkFycmF5O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSByZXN1bWVzLlxyXG4gICAqIFVzZSB0byBjb250aW51ZSBvciBhZGQgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwbGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHBhdXNlcy5cclxuICAgKiBVc2UgdG8gc3RvcCBvciByZW1vdmUgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY29tcG9uZW50IGlzIHJlbW92ZWQgKGUuZy4sIHZpYSByZW1vdmVBdHRyaWJ1dGUpLlxyXG4gICAqIEdlbmVyYWxseSB1bmRvZXMgYWxsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGVudGl0eS5cclxuICAgKi9cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTcGF3bnMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBvYmplY3QgYXQgdGhlIGNvbnRyb2xsZXIgbG9jYXRpb24gd2hlbiB0cmlnZ2VyIHByZXNzZWRcclxuICAgKi9cclxuICBvblBsYWNlT2JqZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIEl0ZW0gZWxlbWVudCAodGhlIHBsYWNlYWJsZSBjaXR5IG9iamVjdCkgc2VsZWN0ZWQgb24gdGhpcyBjb250cm9sbGVyXHJcbiAgICB2YXIgdGhpc0l0ZW1JRCA9ICh0aGlzLmVsLmlkID09PSAnbGVmdENvbnRyb2xsZXInKSA/ICcjbGVmdEl0ZW0nOicjcmlnaHRJdGVtJztcclxuICAgIHZhciB0aGlzSXRlbUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzSXRlbUlEKTtcclxuXHJcbiAgICAvLyBXaGljaCBvYmplY3Qgc2hvdWxkIGJlIHBsYWNlZCBoZXJlPyBUaGlzIElEIGlzIFwic3RvcmVkXCIgaW4gdGhlIERPTSBlbGVtZW50IG9mIHRoZSBjdXJyZW50IEl0ZW1cclxuXHRcdHZhciBvYmplY3RJZCA9IHBhcnNlSW50KHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RJZC52YWx1ZSk7XHJcblxyXG4gICAgLy8gV2hhdCdzIHRoZSB0eXBlIG9mIG9iamVjdD8gRm9yIGV4YW1wbGUsIFwibW1tbV9hbGllblwiIG9yIFwiYmFzZXNcIlxyXG5cdFx0dmFyIG9iamVjdEdyb3VwID0gdGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdEdyb3VwLnZhbHVlO1xyXG5cclxuICAgIC8vIHJvdW5kaW5nIHRydWUgb3IgZmFsc2U/IFdlIHdhbnQgdG8gcm91bmQgcG9zaXRpb24gYW5kIHJvdGF0aW9uIG9ubHkgZm9yIFwiYmFzZXNcIiB0eXBlIG9iamVjdHNcclxuICAgIHZhciByb3VuZGluZyA9IChvYmplY3RHcm91cCA9PSAna2ZhcnJfYmFzZXMnKTtcclxuXHJcbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxyXG4gICAgdmFyIG9iamVjdEFycmF5ID0gdGhpcy5ncm91cEpTT05BcnJheVtvYmplY3RHcm91cF07XHJcblxyXG4gICAgLy8gR2V0IHRoZSBJdGVtJ3MgY3VycmVudCB3b3JsZCBjb29yZGluYXRlcyAtIHdlJ3JlIGdvaW5nIHRvIHBsYWNlIGl0IHJpZ2h0IHdoZXJlIGl0IGlzIVxyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRQb3NpdGlvbiA9IHRoaXNJdGVtRWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvbiA9IHRoaXNJdGVtRWwub2JqZWN0M0QuZ2V0V29ybGRSb3RhdGlvbigpO1xyXG5cdFx0dmFyIG9yaWdpbmFsUG9zaXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUG9zaXRpb24ueCArICcgJyArIHRoaXNJdGVtV29ybGRQb3NpdGlvbi55ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLno7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyBwb3NpdGlvbiB0byB0aGUgbmVhcmVzdCAwLjUwIGZvciBhIGJhc2ljIFwiZ3JpZCBzbmFwcGluZ1wiIGVmZmVjdFxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblggPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueiAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRQb3NpdGlvblN0cmluZyA9IHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblggKyAnIDAuNTAgJyArIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblo7XHJcblxyXG4gICAgLy8gRmV0Y2ggdGhlIGN1cnJlbnQgSXRlbSdzIHJvdGF0aW9uIGFuZCBjb252ZXJ0IGl0IHRvIGEgRXVsZXIgc3RyaW5nXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWCA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feCAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25ZID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl95IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblogPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ogLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgb3JpZ2luYWxFdWxlclJvdGF0aW9uU3RyaW5nID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWCArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUm90YXRpb25aO1xyXG5cclxuICAgIC8vIFJvdW5kIHRoZSBJdGVtJ3Mgcm90YXRpb24gdG8gdGhlIG5lYXJlc3QgOTAgZGVncmVlcyBmb3IgYmFzZSB0eXBlIG9iamVjdHNcclxuXHRcdHZhciByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSAvIDkwKSAqIDkwOyAvLyByb3VuZCB0byA5MCBkZWdyZWVzXHJcblx0XHR2YXIgcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgPSAwICsgJyAnICsgcm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkgKyAnICcgKyAwOyAvLyBpZ25vcmUgcm9sbCBhbmQgcGl0Y2hcclxuXHJcbiAgICB2YXIgbmV3SWQgPSAnb2JqZWN0JyArIG9iamVjdENvdW50O1xyXG5cclxuICAgICQoJzxhLWVudGl0eSAvPicsIHtcclxuICAgICAgaWQ6IG5ld0lkLFxyXG4gICAgICBjbGFzczogJ2NpdHkgb2JqZWN0IGNoaWxkcmVuJyxcclxuICAgICAgc2NhbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgcm90YXRpb246IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgIGZpbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAvLyBcInBseS1tb2RlbFwiOiBcInNyYzogdXJsKG5ld19hc3NldHMvXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLnBseSlcIixcclxuICAgICAgXCJvYmotbW9kZWxcIjogXCJvYmo6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopOyBtdGw6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCIsXHJcbiAgICAgIGFwcGVuZFRvIDogJCgnI2NpdHknKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG5ld09iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5ld0lkKTtcclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblwiLCByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcpOyAvLyB0aGlzIGRvZXMgc2V0IHBvc2l0aW9uXHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIFwiYmFzZXNcIiB0eXBlIG9iamVjdCwgYW5pbWF0ZSB0aGUgdHJhbnNpdGlvbiB0byB0aGUgc25hcHBlZCAocm91bmRlZCkgcG9zaXRpb24gYW5kIHJvdGF0aW9uXHJcbiAgICBpZiAocm91bmRpbmcpIHtcclxuICAgICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3JvdGF0aW9uJywgZHVyOiA1MDAsIGZyb206IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZywgdG86IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJmaXJlYmFzZS1icm9hZGNhc3RcIiwgXCJjb21wb25lbnRzOiBwb3NpdGlvbiwgc2NhbGUsIHJvdGF0aW9uLCBmaWxlLCBvYmotbW9kZWwsIGNsYXNzOyBwZXJzaXN0OiB0cnVlXCIpO1xyXG5cclxuXHJcbiAgICAvLyBJbmNyZW1lbnQgdGhlIG9iamVjdCBjb3VudGVyIHNvIHN1YnNlcXVlbnQgb2JqZWN0cyBoYXZlIHRoZSBjb3JyZWN0IGluZGV4XHJcblx0XHRvYmplY3RDb3VudCArPSAxO1xyXG4gIH0sXHJcblxyXG5cdG9uT2JqZWN0Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm9uT2JqZWN0Q2hhbmdlIHRyaWdnZXJlZFwiKTtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0IGN1cnJlbnRseSBzZWxlY3RlZD8gRm9yIGV4YW1wbGUsIFwibW1tbV9hbGllblwiIG9yIFwiYmFzZXNcIlxyXG4gICAgdmFyIG9iamVjdEdyb3VwID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGdyb3VwVmFsdWU7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIFdoYXQgaXMgdGhlIElEIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgaXRlbT9cclxuICAgIHZhciBuZXdPYmplY3RJZCA9IHBhcnNlSW50KG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25JbmRleCk7XHJcbiAgICB2YXIgc2VsZWN0ZWRPcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuXHJcblx0XHQvLyBTZXQgdGhlIHByZXZpZXcgb2JqZWN0IHRvIGJlIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgXCJwcmV2aWV3XCIgaXRlbVxyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iai1tb2RlbCcsIHsgb2JqOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10bDogXCJ1cmwoYXNzZXRzL29iai9cIiArIG9iamVjdEFycmF5W25ld09iamVjdElkXS5maWxlICsgXCIubXRsKVwifSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnc2NhbGUnLCBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uc2NhbGUpO1xyXG5cdFx0dGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdElkJywgbmV3T2JqZWN0SWQpO1xyXG4gICAgdGhpc0l0ZW1FbC5zZXRBdHRyaWJ1dGUoJ29iamVjdEdyb3VwJywgb2JqZWN0R3JvdXApO1xyXG4gICAgdGhpc0l0ZW1FbC5mbHVzaFRvRE9NKCk7XHJcblx0fSxcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kbyAtIGRlbGV0ZXMgdGhlIG1vc3QgcmVjZW50bHkgcGxhY2VkIG9iamVjdFxyXG4gICAqL1xyXG4gIG9uVW5kbzogZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIHByZXZpb3VzT2JqZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvYmplY3RcIiArIChvYmplY3RDb3VudCAtIDEpKTtcclxuXHRcdHByZXZpb3VzT2JqZWN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNPYmplY3QpO1xyXG5cdFx0b2JqZWN0Q291bnQgLT0gMTtcclxuXHRcdGlmKG9iamVjdENvdW50ID09IC0xKSB7b2JqZWN0Q291bnQgPSAwfTtcclxuICB9XHJcblxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2J1aWxkZXItY29udHJvbHMuanMiLCIvKiBnbG9iYWwgQUZSQU1FLCBUSFJFRSAqL1xyXG5cclxuLyoqXHJcbiAqIExvYWRzIGFuZCBzZXR1cCBncm91bmQgbW9kZWwuXHJcbiAqL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2dyb3VuZCcsIHtcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb2JqZWN0TG9hZGVyO1xyXG4gICAgdmFyIG9iamVjdDNEID0gdGhpcy5lbC5vYmplY3QzRDtcclxuICAgIC8vIHZhciBNT0RFTF9VUkwgPSAnaHR0cHM6Ly9jZG4uYWZyYW1lLmlvL2xpbmstdHJhdmVyc2FsL21vZGVscy9ncm91bmQuanNvbic7XHJcbiAgICB2YXIgTU9ERUxfVVJMID0gJ2Fzc2V0cy9lbnZpcm9ubWVudC9ncm91bmQuanNvbic7XHJcbiAgICBpZiAodGhpcy5vYmplY3RMb2FkZXIpIHsgcmV0dXJuOyB9XHJcbiAgICBvYmplY3RMb2FkZXIgPSB0aGlzLm9iamVjdExvYWRlciA9IG5ldyBUSFJFRS5PYmplY3RMb2FkZXIoKTtcclxuICAgIG9iamVjdExvYWRlci5jcm9zc09yaWdpbiA9ICcnO1xyXG4gICAgb2JqZWN0TG9hZGVyLmxvYWQoTU9ERUxfVVJMLCBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgIG9iai5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xyXG4gICAgICAgIHZhbHVlLm1hdGVyaWFsLnNoYWRpbmcgPSBUSFJFRS5GbGF0U2hhZGluZztcclxuICAgICAgfSk7XHJcbiAgICAgIG9iamVjdDNELmFkZChvYmopO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2dyb3VuZC5qcyIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuQUZSQU1FLnJlZ2lzdGVyU2hhZGVyKCdza3lHcmFkaWVudCcsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbG9yVG9wOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICdibGFjaycsIGlzOiAndW5pZm9ybScgfSxcclxuICAgIGNvbG9yQm90dG9tOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICdyZWQnLCBpczogJ3VuaWZvcm0nIH1cclxuICB9LFxyXG5cclxuICB2ZXJ0ZXhTaGFkZXI6IFtcclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCkgeycsXHJcblxyXG4gICAgICAndmVjNCB3b3JsZFBvc2l0aW9uID0gbW9kZWxNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7JyxcclxuICAgICAgJ3ZXb3JsZFBvc2l0aW9uID0gd29ybGRQb3NpdGlvbi54eXo7JyxcclxuXHJcbiAgICAgICdnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7JyxcclxuXHJcbiAgICAnfSdcclxuXHJcbiAgXS5qb2luKCdcXG4nKSxcclxuXHJcbiAgZnJhZ21lbnRTaGFkZXI6IFtcclxuICAgICd1bmlmb3JtIHZlYzMgY29sb3JUb3A7JyxcclxuICAgICd1bmlmb3JtIHZlYzMgY29sb3JCb3R0b207JyxcclxuXHJcbiAgICAndmFyeWluZyB2ZWMzIHZXb3JsZFBvc2l0aW9uOycsXHJcblxyXG4gICAgJ3ZvaWQgbWFpbigpJyxcclxuXHJcbiAgICAneycsXHJcbiAgICAgICd2ZWMzIHBvaW50T25TcGhlcmUgPSBub3JtYWxpemUodldvcmxkUG9zaXRpb24ueHl6KTsnLFxyXG4gICAgICAnZmxvYXQgZiA9IDEuMDsnLFxyXG4gICAgICAnaWYocG9pbnRPblNwaGVyZS55ID4gLSAwLjIpeycsXHJcblxyXG4gICAgICAgICdmID0gc2luKHBvaW50T25TcGhlcmUueSAqIDIuMCk7JyxcclxuXHJcbiAgICAgICd9JyxcclxuICAgICAgJ2dsX0ZyYWdDb2xvciA9IHZlYzQobWl4KGNvbG9yQm90dG9tLGNvbG9yVG9wLCBmICksIDEuMCk7JyxcclxuXHJcbiAgICAnfSdcclxuICBdLmpvaW4oJ1xcbicpXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvc2t5R3JhZGllbnQuanMiXSwic291cmNlUm9vdCI6IiJ9