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
	 *
	 * @member {boolean} animationIsPlaying - Used during initialization and scene resume to see
	 *  if animation should be playing.
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
	
	  /**
	   * `remove` handler.
	   */
	  remove: function () {
	    this.pauseAnimation();
	    this.removeEventListeners();
	  },
	
	  /**
	   * `pause` handler.
	   */
	  pause: function () {
	    this.pauseAnimation();
	    this.removeEventListeners();
	  },
	
	  /**
	   * `play` handler.
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
	    this.animation = anime(this.config);
	    this.animation.play();
	  },
	
	  pauseAnimation: function () {
	    this.animation.pause();
	  },
	
	  resumeAnimation: function () {
	    this.animation.play();
	  },
	
	  restartAnimation: function () {
	    this.animation.restart();
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
	    // console.log(this.data.menuID);
	    var menuEl = document.getElementById(this.data.menuID);
	
	    // console.log("action-controls: menu element: " + menuEl);
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    // console.log("optionValue" + optionValue);
	    // console.log(optionValue);
	
	    // do the thing associated with the action
	    this.handleActionStart(optionValue);
	  },
	
	  onActionSelect: function onActionSelect() {
	    // what is the action
	    var menuEl = document.getElementById(this.data.menuID);
	
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    // console.log("onActionSelect triggered; current optionValue:\n");
	    // console.log(optionValue);
	    // call the thing that does it
	
	    switch (optionValue) {
	      case "save":
	        console.log("save requested");
	        saveButton({ overwrite: true });
	        return; // without this return the other cases are fired - weird!
	      case "saveAs":
	        console.log("saveAs requested");
	        saveButton();
	        return;
	      case "new":
	        console.log("new requested");
	        var cityEl = document.getElementById("city");
	        while (cityEl.firstChild) {
	          cityEl.removeChild(cityEl.firstChild);
	        }
	        document.getElementById("title").setAttribute("text__cityname", "value", "#NewCity");
	        document.title = "aframe.city";
	        return;
	      case "undo":
	        // find element with "builder-controls" attribute
	        // fire the onUndo event
	        document.querySelectorAll('a-entity[builder-controls]')[0].components['builder-controls'].onUndo();
	        //        var menuEl = document.getElementById(this.data.menuID);
	        //        var undoResult = menuEl.components['select-bar'].selectedOptionValue;
	        return;
	      case "exit":
	        document.querySelector('a-scene').exitVR();
	        return;
	    }
	  },
	
	  onActionChange: function onActionChange() {
	    // undo old one
	    this.handleActionEnd(this.previousAction);
	
	    var menuEl = document.getElementById(this.data.menuID);
	    // get currently selected action
	    var optionValue = menuEl.components['select-bar'].selectedOptionValue;
	    // console.log("new optionValue: " + optionValue);
	    // console.log(optionValue);
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
	    var controlEl = this.el;
	
	    // for given optionValue, do something
	    switch (optionValue) {
	
	      case "teleport":
	        // add teleport component to the control element that is the parent of this menu
	        console.log("teleportStart");
	
	        // Add attribute from this html: teleport-controls="button: trigger; collisionEntities: #ground"
	        controlEl.setAttribute("teleport-controls", "button: trigger; collisionEntities: #ground");
	        return;
	      case "erase":
	        console.log("eraseStart");
	        // add attribute for raycaster cursor for selecting object to delete https://github.com/bryik/aframe-controller-cursor-component
	        controlEl.setAttribute("controller-cursor", "color: red");
	        controlEl.setAttribute("raycaster", "objects: .object");
	
	        // create listener for mouse down event on this element:
	        controlEl.addEventListener('click', function (evt) {
	          // console.log('I was clicked at: ', evt.detail.intersection.point);
	          // console.log(evt.detail);
	          console.log("erase requested (click event fired on controlEl)");
	          //          console.log(evt.detail.intersectedEl);
	          // evt.detail.intersectedEl.setAttribute("visible", "false");
	          evt.detail.intersectedEl.parentNode.removeChild(evt.detail.intersectedEl);
	        });
	        return;
	
	        controlEl.addEventListener('mouseenter', function (evt) {
	          // console.log('I was clicked at: ', evt.detail.intersection.point);
	          // console.log(evt.detail);
	          // NOTE: this does not appear to be firing
	          console.log("MOUSEENTER event fired on controlEl");
	          console.log(evt.detail.intersectedEl);
	          evt.detail.intersectedEl.setAttribute("material", "color", "red");
	        });
	        // monitor for event when the controlEl cursor emits:
	        return;
	    }
	  },
	
	  handleActionEnd: function handleActionEnd(optionValue) {
	    var controlEl = this.el;
	
	    // for given optionValue, do something
	    switch (optionValue) {
	      case "teleport":
	        // remove teleport component
	        console.log("teleportEnd");
	        controlEl.removeAttribute("teleport-controls");
	        return;
	      case "erase":
	        controlEl.removeAttribute("raycaster");
	        controlEl.removeAttribute("controller-cursor");
	        console.log("eraseEnd");
	        controlEl.removeEventListener('click', function () {});
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
	
	    // OLD var newId = 'object' + document.getElementById('city').childElementCount;
	    // NEW https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	    var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	      var r = Math.random() * 16 | 0,
	          v = c == 'x' ? r : r & 0x3 | 0x8;return v.toString(16);
	    });
	    console.log("newId:" + newId);
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
	
	    // anonymous tracking using amplitude.com, see https://github.com/kfarr/aframe-city-builder/issues/19
	    var ampEventProperties = {
	      'file': objectArray[objectId].file,
	      'position': rounding ? roundedPositionString : originalPositionString,
	      'rotation': rounding ? roundedEulerRotationString : originalEulerRotationString,
	      'scale': objectArray[objectId].scale,
	      'id': newId
	    };
	    amplitude.getInstance().logEvent('Place Object', ampEventProperties);
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
	    cityChildElementCount = document.getElementById('city').childElementCount;
	    if (cityChildElementCount > 0) {
	      var previousObject = document.querySelector("#object" + (cityChildElementCount - 1));
	      previousObject.parentNode.removeChild(previousObject);
	    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjhjYWFkNGE2YjVjNTRiN2Y0N2EiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL2FjdGlvbi1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJyZWdpc3RlckNvbXBvbmVudCIsInNjaGVtYSIsIm1lbnVJRCIsInR5cGUiLCJkZWZhdWx0IiwibXVsdGlwbGUiLCJhZGRFdmVudExpc3RlbmVycyIsIm1lbnVFbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJkYXRhIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uQWN0aW9uQ2hhbmdlIiwiYmluZCIsIm9uQWN0aW9uU2VsZWN0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5pdCIsIm9wdGlvblZhbHVlIiwiY29tcG9uZW50cyIsInNlbGVjdGVkT3B0aW9uVmFsdWUiLCJoYW5kbGVBY3Rpb25TdGFydCIsImNvbnNvbGUiLCJsb2ciLCJzYXZlQnV0dG9uIiwib3ZlcndyaXRlIiwiY2l0eUVsIiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwic2V0QXR0cmlidXRlIiwidGl0bGUiLCJxdWVyeVNlbGVjdG9yQWxsIiwib25VbmRvIiwicXVlcnlTZWxlY3RvciIsImV4aXRWUiIsImhhbmRsZUFjdGlvbkVuZCIsInByZXZpb3VzQWN0aW9uIiwicGxheSIsInBhdXNlIiwicmVtb3ZlIiwiY29udHJvbEVsIiwiZWwiLCJldnQiLCJkZXRhaWwiLCJpbnRlcnNlY3RlZEVsIiwicGFyZW50Tm9kZSIsInJlbW92ZUF0dHJpYnV0ZSIsImh1bWFuaXplIiwic3RyIiwiZnJhZ3MiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiam9pbiIsIm1lbnVJZCIsIm9uT2JqZWN0Q2hhbmdlIiwib25QbGFjZU9iamVjdCIsImxpc3QiLCJncm91cEpTT05BcnJheSIsImZvckVhY2giLCJncm91cE5hbWUiLCJpbmRleCIsInJlcXVlc3RVUkwiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2VuZCIsIm9ubG9hZCIsInJlc3BvbnNlIiwibmV3T3B0Z3JvdXBFbCIsImNyZWF0ZUVsZW1lbnQiLCJvcHRpb25zSFRNTCIsIm9iamVjdERlZmluaXRpb24iLCJpbm5lckhUTUwiLCJhcHBlbmRDaGlsZCIsInRoaXNJdGVtSUQiLCJpZCIsInRoaXNJdGVtRWwiLCJvYmplY3RJZCIsInBhcnNlSW50IiwiYXR0cmlidXRlcyIsInZhbHVlIiwib2JqZWN0R3JvdXAiLCJyb3VuZGluZyIsIm9iamVjdEFycmF5IiwidGhpc0l0ZW1Xb3JsZFBvc2l0aW9uIiwib2JqZWN0M0QiLCJnZXRXb3JsZFBvc2l0aW9uIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uIiwiZ2V0V29ybGRSb3RhdGlvbiIsIm9yaWdpbmFsUG9zaXRpb25TdHJpbmciLCJ4IiwieSIsInoiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YIiwiTWF0aCIsInJvdW5kIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvbloiLCJyb3VuZGVkUG9zaXRpb25TdHJpbmciLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25YIiwiX3giLCJQSSIsInRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJfeSIsInRoaXNJdGVtV29ybGRSb3RhdGlvbloiLCJfeiIsIm9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyIsInJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZIiwicm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmciLCJuZXdJZCIsInJlcGxhY2UiLCJjIiwiciIsInJhbmRvbSIsInYiLCJ0b1N0cmluZyIsIiQiLCJjbGFzcyIsInNjYWxlIiwicm90YXRpb24iLCJmaWxlIiwiYXBwZW5kVG8iLCJuZXdPYmplY3QiLCJwcm9wZXJ0eSIsImR1ciIsImZyb20iLCJ0byIsImFtcEV2ZW50UHJvcGVydGllcyIsImFtcGxpdHVkZSIsImdldEluc3RhbmNlIiwibG9nRXZlbnQiLCJzZWxlY3RlZE9wdGdyb3VwVmFsdWUiLCJuZXdPYmplY3RJZCIsInNlbGVjdGVkT3B0aW9uSW5kZXgiLCJvYmoiLCJtdGwiLCJmbHVzaFRvRE9NIiwiY2l0eUNoaWxkRWxlbWVudENvdW50IiwiY2hpbGRFbGVtZW50Q291bnQiLCJwcmV2aW91c09iamVjdCIsIm9iamVjdExvYWRlciIsIk1PREVMX1VSTCIsIlRIUkVFIiwiT2JqZWN0TG9hZGVyIiwiY3Jvc3NPcmlnaW4iLCJsb2FkIiwiY2hpbGRyZW4iLCJyZWNlaXZlU2hhZG93IiwibWF0ZXJpYWwiLCJzaGFkaW5nIiwiRmxhdFNoYWRpbmciLCJhZGQiLCJyZWdpc3RlclNoYWRlciIsImNvbG9yVG9wIiwiaXMiLCJjb2xvckJvdHRvbSIsInZlcnRleFNoYWRlciIsImZyYWdtZW50U2hhZGVyIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdENBLG9CQUFBQSxDQUFRLENBQVI7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QTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBaUMsa0JBQWtCLEVBQUU7QUFDckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNERBQTJELGFBQWEsRUFBRTtBQUMxRTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNEQUFxRCw4QkFBOEIsRUFBRTtBQUNyRiw0QkFBMkIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTRDLDBCQUEwQixFQUFFO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FB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QUEzQjtBQUNBSixrQkFBYUssSUFBYixDQUFrQkosU0FBbEIsRUFBNkIsVUFBVVAsR0FBVixFQUFlO0FBQzFDQSxXQUFJWSxRQUFKLENBQWF6RixPQUFiLENBQXFCLFVBQVV1QixLQUFWLEVBQWlCO0FBQ3BDQSxlQUFNbUUsYUFBTixHQUFzQixJQUF0QjtBQUNBbkUsZUFBTW9FLFFBQU4sQ0FBZUMsT0FBZixHQUF5QlAsTUFBTVEsV0FBL0I7QUFDRCxRQUhEO0FBSUFqRSxnQkFBU2tFLEdBQVQsQ0FBYWpCLEdBQWI7QUFDRCxNQU5EO0FBT0Q7QUFoQmdDLEVBQW5DLEU7Ozs7Ozs7O0FDTEE7QUFDQTdJLFFBQU8rSixjQUFQLENBQXNCLGFBQXRCLEVBQXFDO0FBQ25DNUosV0FBUTtBQUNONkosZUFBVSxFQUFFM0osTUFBTSxPQUFSLEVBQWlCQyxTQUFTLE9BQTFCLEVBQW1DMkosSUFBSSxTQUF2QyxFQURKO0FBRU5DLGtCQUFhLEVBQUU3SixNQUFNLE9BQVIsRUFBaUJDLFNBQVMsS0FBMUIsRUFBaUMySixJQUFJLFNBQXJDO0FBRlAsSUFEMkI7O0FBTW5DRSxpQkFBYyxDQUNaLDhCQURZLEVBR1osZUFIWSxFQUtWLDJEQUxVLEVBTVYscUNBTlUsRUFRViwyRUFSVSxFQVVaLEdBVlksRUFZWnpHLElBWlksQ0FZUCxJQVpPLENBTnFCOztBQW9CbkMwRyxtQkFBZ0IsQ0FDZCx3QkFEYyxFQUVkLDJCQUZjLEVBSWQsOEJBSmMsRUFNZCxhQU5jLEVBUWQsR0FSYyxFQVNaLHFEQVRZLEVBVVosZ0JBVlksRUFXWiw4QkFYWSxFQWFWLGlDQWJVLEVBZVosR0FmWSxFQWdCWiwwREFoQlksRUFrQmQsR0FsQmMsRUFtQmQxRyxJQW5CYyxDQW1CVCxJQW5CUztBQXBCbUIsRUFBckMsRSIsImZpbGUiOiJhZnJhbWUtY2l0eS1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZjhjYWFkNGE2YjVjNTRiN2Y0N2EiLCJyZXF1aXJlKCdhZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnYWZyYW1lLWFuaW1hdGlvbi1jb21wb25lbnQnKTtcclxucmVxdWlyZSgnLi9saWIvYWN0aW9uLWNvbnRyb2xzLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL2J1aWxkZXItY29udHJvbHMuanMnKTtcclxucmVxdWlyZSgnLi9saWIvZ3JvdW5kLmpzJyk7XHJcbnJlcXVpcmUoJy4vbGliL3NreUdyYWRpZW50LmpzJyk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LmpzIiwiaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbi8qKlxuICogR3JpZEhlbHBlciBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JpZGhlbHBlcicsIHtcbiAgc2NoZW1hOiB7XG4gICAgc2l6ZTogeyBkZWZhdWx0OiA1IH0sXG4gICAgZGl2aXNpb25zOiB7IGRlZmF1bHQ6IDEwIH0sXG4gICAgY29sb3JDZW50ZXJMaW5lOiB7ZGVmYXVsdDogJ3JlZCd9LFxuICAgIGNvbG9yR3JpZDoge2RlZmF1bHQ6ICdibGFjayd9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbmNlIHdoZW4gY29tcG9uZW50IGlzIGF0dGFjaGVkLiBHZW5lcmFsbHkgZm9yIGluaXRpYWwgc2V0dXAuXG4gICAqL1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcblxuICAgIHZhciBzaXplID0gZGF0YS5zaXplO1xuICAgIHZhciBkaXZpc2lvbnMgPSBkYXRhLmRpdmlzaW9ucztcbiAgICB2YXIgY29sb3JDZW50ZXJMaW5lID0gZGF0YS5jb2xvckNlbnRlckxpbmU7XG4gICAgdmFyIGNvbG9yR3JpZCA9IGRhdGEuY29sb3JHcmlkO1xuXG4gICAgdmFyIGdyaWRIZWxwZXIgPSBuZXcgVEhSRUUuR3JpZEhlbHBlciggc2l6ZSwgZGl2aXNpb25zLCBjb2xvckNlbnRlckxpbmUsIGNvbG9yR3JpZCApO1xuICAgIGdyaWRIZWxwZXIubmFtZSA9IFwiZ3JpZEhlbHBlclwiO1xuICAgIHNjZW5lLmFkZChncmlkSGVscGVyKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjZW5lID0gdGhpcy5lbC5vYmplY3QzRDtcbiAgICBzY2VuZS5yZW1vdmUoc2NlbmUuZ2V0T2JqZWN0QnlOYW1lKFwiZ3JpZEhlbHBlclwiKSk7XG4gIH1cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBnbG9iYWwgQUZSQU1FICovXG5cbnZhciBhbmltZSA9IHJlcXVpcmUoJ2FuaW1lanMnKTtcblxuaWYgKHR5cGVvZiBBRlJBTUUgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XG59XG5cbnZhciB1dGlscyA9IEFGUkFNRS51dGlscztcbnZhciBnZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5nZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzZXRDb21wb25lbnRQcm9wZXJ0eSA9IHV0aWxzLmVudGl0eS5zZXRDb21wb25lbnRQcm9wZXJ0eTtcbnZhciBzdHlsZVBhcnNlciA9IHV0aWxzLnN0eWxlUGFyc2VyLnBhcnNlO1xuXG4vKipcbiAqIEFuaW1hdGlvbiBjb21wb25lbnQgZm9yIEEtRnJhbWUuXG4gKlxuICogQG1lbWJlciB7Ym9vbGVhbn0gYW5pbWF0aW9uSXNQbGF5aW5nIC0gVXNlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24gYW5kIHNjZW5lIHJlc3VtZSB0byBzZWVcbiAqICBpZiBhbmltYXRpb24gc2hvdWxkIGJlIHBsYXlpbmcuXG4gKi9cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYW5pbWF0aW9uJywge1xuICBzY2hlbWE6IHtcbiAgICBkZWxheToge2RlZmF1bHQ6IDB9LFxuICAgIGRpcjoge2RlZmF1bHQ6ICcnfSxcbiAgICBkdXI6IHtkZWZhdWx0OiAxMDAwfSxcbiAgICBlYXNpbmc6IHtkZWZhdWx0OiAnZWFzZUluUXVhZCd9LFxuICAgIGVsYXN0aWNpdHk6IHtkZWZhdWx0OiA0MDB9LFxuICAgIGZyb206IHtkZWZhdWx0OiAnJ30sXG4gICAgbG9vcDoge2RlZmF1bHQ6IGZhbHNlfSxcbiAgICBwcm9wZXJ0eToge2RlZmF1bHQ6ICcnfSxcbiAgICByZXBlYXQ6IHtkZWZhdWx0OiAwfSxcbiAgICBzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHBhdXNlRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdW1lRXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcmVzdGFydEV2ZW50czoge3R5cGU6ICdhcnJheSd9LFxuICAgIHRvOiB7ZGVmYXVsdDogJyd9XG4gIH0sXG5cbiAgbXVsdGlwbGU6IHRydWUsXG5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uID0gbnVsbDtcbiAgICB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXlBbmltYXRpb25Cb3VuZCA9IHRoaXMucGxheUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGF1c2VBbmltYXRpb25Cb3VuZCA9IHRoaXMucGF1c2VBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3VtZUFuaW1hdGlvbkJvdW5kID0gdGhpcy5yZXN1bWVBbmltYXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlc3RhcnRBbmltYXRpb25Cb3VuZCA9IHRoaXMucmVzdGFydEFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVwZWF0ID0gMDtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLmF0dHJOYW1lO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcGVydHlUeXBlKGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIWRhdGEucHJvcGVydHkpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBCYXNlIGNvbmZpZy5cbiAgICB0aGlzLnJlcGVhdCA9IGRhdGEucmVwZWF0O1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICBhdXRvcGxheTogZmFsc2UsXG4gICAgICBiZWdpbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5lbWl0KCdhbmltYXRpb25iZWdpbicpO1xuICAgICAgICBlbC5lbWl0KGF0dHJOYW1lICsgJy1iZWdpbicpO1xuICAgICAgfSxcbiAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsLmVtaXQoJ2FuaW1hdGlvbmNvbXBsZXRlJyk7XG4gICAgICAgIGVsLmVtaXQoYXR0ck5hbWUgKyAnLWNvbXBsZXRlJyk7XG4gICAgICAgIC8vIFJlcGVhdC5cbiAgICAgICAgaWYgKC0tc2VsZi5yZXBlYXQgPiAwKSB7IHNlbGYuYW5pbWF0aW9uLnBsYXkoKTsgfVxuICAgICAgfSxcbiAgICAgIGRpcmVjdGlvbjogZGF0YS5kaXIsXG4gICAgICBkdXJhdGlvbjogZGF0YS5kdXIsXG4gICAgICBlYXNpbmc6IGRhdGEuZWFzaW5nLFxuICAgICAgZWxhc3RpY2l0eTogZGF0YS5lbGFzdGljaXR5LFxuICAgICAgbG9vcDogZGF0YS5sb29wXG4gICAgfTtcblxuICAgIC8vIEN1c3RvbWl6ZSBjb25maWcgYmFzZWQgb24gcHJvcGVydHkgdHlwZS5cbiAgICB2YXIgdXBkYXRlQ29uZmlnID0gY29uZmlnRGVmYXVsdDtcbiAgICBpZiAocHJvcFR5cGUgPT09ICd2ZWMyJyB8fCBwcm9wVHlwZSA9PT0gJ3ZlYzMnIHx8IHByb3BUeXBlID09PSAndmVjNCcpIHtcbiAgICAgIHVwZGF0ZUNvbmZpZyA9IGNvbmZpZ1ZlY3RvcjtcbiAgICB9XG5cbiAgICAvLyBDb25maWcuXG4gICAgdGhpcy5jb25maWcgPSB1cGRhdGVDb25maWcoZWwsIGRhdGEsIGNvbmZpZyk7XG4gICAgdGhpcy5hbmltYXRpb24gPSBhbmltZSh0aGlzLmNvbmZpZyk7XG5cbiAgICAvLyBTdG9wIHByZXZpb3VzIGFuaW1hdGlvbi5cbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuZGF0YS5zdGFydEV2ZW50cy5sZW5ndGgpIHsgdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcgPSB0cnVlOyB9XG5cbiAgICAvLyBQbGF5IGFuaW1hdGlvbiBpZiBubyBob2xkaW5nIGV2ZW50LlxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGByZW1vdmVgIGhhbmRsZXIuXG4gICAqL1xuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBhdXNlQW5pbWF0aW9uKCk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBgcGF1c2VgIGhhbmRsZXIuXG4gICAqL1xuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGBwbGF5YCBoYW5kbGVyLlxuICAgKi9cbiAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5hbmltYXRpb24gfHwgIXRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nKSB7IHJldHVybjsgfVxuXG4gICAgLy8gRGVsYXkuXG4gICAgaWYgKGRhdGEuZGVsYXkpIHtcbiAgICAgIHNldFRpbWVvdXQocGxheSwgZGF0YS5kZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICAgIHNlbGYucGxheUFuaW1hdGlvbigpO1xuICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBkYXRhLnN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wbGF5QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucGF1c2VFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBhdXNlQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdW1lRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN1bWVBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN0YXJ0RXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5yZXN0YXJ0QW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHBsYXlBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGFuaW1lKHRoaXMuY29uZmlnKTtcbiAgICB0aGlzLmFuaW1hdGlvbi5wbGF5KCk7XG4gIH0sXG5cbiAgcGF1c2VBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5wYXVzZSgpO1xuICB9LFxuXG4gIHJlc3VtZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgfSxcblxuICByZXN0YXJ0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucmVzdGFydCgpO1xuICB9XG59KTtcblxuLyoqXG4gKiBTdHVmZiBwcm9wZXJ0eSBpbnRvIGdlbmVyaWMgYHByb3BlcnR5YCBrZXkuXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ0RlZmF1bHQgKGVsLCBkYXRhLCBjb25maWcpIHtcbiAgdmFyIGZyb20gPSBkYXRhLmZyb20gfHwgZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICByZXR1cm4gQUZSQU1FLnV0aWxzLmV4dGVuZCh7fSwgY29uZmlnLCB7XG4gICAgdGFyZ2V0czogW3thZnJhbWVQcm9wZXJ0eTogZnJvbX1dLFxuICAgIGFmcmFtZVByb3BlcnR5OiBkYXRhLnRvLFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHksIHRoaXMudGFyZ2V0c1swXS5hZnJhbWVQcm9wZXJ0eSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBFeHRlbmQgeC95L3ovdyBvbnRvIHRoZSBjb25maWcuXG4gKi9cbmZ1bmN0aW9uIGNvbmZpZ1ZlY3RvciAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGdldENvbXBvbmVudFByb3BlcnR5KGVsLCBkYXRhLnByb3BlcnR5KTtcbiAgaWYgKGRhdGEuZnJvbSkgeyBmcm9tID0gQUZSQU1FLnV0aWxzLmNvb3JkaW5hdGVzLnBhcnNlKGRhdGEuZnJvbSk7IH1cbiAgdmFyIHRvID0gQUZSQU1FLnV0aWxzLmNvb3JkaW5hdGVzLnBhcnNlKGRhdGEudG8pO1xuICByZXR1cm4gQUZSQU1FLnV0aWxzLmV4dGVuZCh7fSwgY29uZmlnLCB7XG4gICAgdGFyZ2V0czogW2Zyb21dLFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgc2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHksIHRoaXMudGFyZ2V0c1swXSk7XG4gICAgfVxuICB9LCB0byk7XG59XG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5VHlwZSAoZWwsIHByb3BlcnR5KSB7XG4gIHZhciBzcGxpdCA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gIHZhciBjb21wb25lbnROYW1lID0gc3BsaXRbMF07XG4gIHZhciBwcm9wZXJ0eU5hbWUgPSBzcGxpdFsxXTtcbiAgdmFyIGNvbXBvbmVudCA9IGVsLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV0gfHwgQUZSQU1FLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV07XG5cbiAgLy8gUHJpbWl0aXZlcy5cbiAgaWYgKCFjb21wb25lbnQpIHsgcmV0dXJuIG51bGw7IH1cblxuICBpZiAocHJvcGVydHlOYW1lKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWFbcHJvcGVydHlOYW1lXS50eXBlO1xuICB9XG4gIHJldHVybiBjb21wb25lbnQuc2NoZW1hLnR5cGU7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWFuaW1hdGlvbi1jb21wb25lbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcbiAqIEFuaW1lIHYxLjEuM1xuICogaHR0cDovL2FuaW1lLWpzLmNvbVxuICogSmF2YVNjcmlwdCBhbmltYXRpb24gZW5naW5lXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSnVsaWFuIEdhcm5pZXJcbiAqIGh0dHA6Ly9qdWxpYW5nYXJuaWVyLmNvbVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuYW5pbWUgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4gIHZhciB2ZXJzaW9uID0gJzEuMS4zJztcblxuICAvLyBEZWZhdWx0c1xuXG4gIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgZHVyYXRpb246IDEwMDAsXG4gICAgZGVsYXk6IDAsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgYXV0b3BsYXk6IHRydWUsXG4gICAgZGlyZWN0aW9uOiAnbm9ybWFsJyxcbiAgICBlYXNpbmc6ICdlYXNlT3V0RWxhc3RpYycsXG4gICAgZWxhc3RpY2l0eTogNDAwLFxuICAgIHJvdW5kOiBmYWxzZSxcbiAgICBiZWdpbjogdW5kZWZpbmVkLFxuICAgIHVwZGF0ZTogdW5kZWZpbmVkLFxuICAgIGNvbXBsZXRlOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIFRyYW5zZm9ybXNcblxuICB2YXIgdmFsaWRUcmFuc2Zvcm1zID0gWyd0cmFuc2xhdGVYJywgJ3RyYW5zbGF0ZVknLCAndHJhbnNsYXRlWicsICdyb3RhdGUnLCAncm90YXRlWCcsICdyb3RhdGVZJywgJ3JvdGF0ZVonLCAnc2NhbGUnLCAnc2NhbGVYJywgJ3NjYWxlWScsICdzY2FsZVonLCAnc2tld1gnLCAnc2tld1knXTtcbiAgdmFyIHRyYW5zZm9ybSwgdHJhbnNmb3JtU3RyID0gJ3RyYW5zZm9ybSc7XG5cbiAgLy8gVXRpbHNcblxuICB2YXIgaXMgPSB7XG4gICAgYXJyOiBmdW5jdGlvbihhKSB7IHJldHVybiBBcnJheS5pc0FycmF5KGEpIH0sXG4gICAgb2JqOiBmdW5jdGlvbihhKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkuaW5kZXhPZignT2JqZWN0JykgPiAtMSB9LFxuICAgIHN2ZzogZnVuY3Rpb24oYSkgeyByZXR1cm4gYSBpbnN0YW5jZW9mIFNWR0VsZW1lbnQgfSxcbiAgICBkb206IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEubm9kZVR5cGUgfHwgaXMuc3ZnKGEpIH0sXG4gICAgbnVtOiBmdW5jdGlvbihhKSB7IHJldHVybiAhaXNOYU4ocGFyc2VJbnQoYSkpIH0sXG4gICAgc3RyOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ3N0cmluZycgfSxcbiAgICBmbmM6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnZnVuY3Rpb24nIH0sXG4gICAgdW5kOiBmdW5jdGlvbihhKSB7IHJldHVybiB0eXBlb2YgYSA9PT0gJ3VuZGVmaW5lZCcgfSxcbiAgICBudWw6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnbnVsbCcgfSxcbiAgICBoZXg6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC8oXiNbMC05QS1GXXs2fSQpfCheI1swLTlBLUZdezN9JCkvaS50ZXN0KGEpIH0sXG4gICAgcmdiOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXnJnYi8udGVzdChhKSB9LFxuICAgIGhzbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gL15oc2wvLnRlc3QoYSkgfSxcbiAgICBjb2w6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIChpcy5oZXgoYSkgfHwgaXMucmdiKGEpIHx8IGlzLmhzbChhKSkgfVxuICB9XG5cbiAgLy8gRWFzaW5ncyBmdW5jdGlvbnMgYWRhcHRlZCBmcm9tIGh0dHA6Ly9qcXVlcnl1aS5jb20vXG5cbiAgdmFyIGVhc2luZ3MgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVhc2VzID0ge307XG4gICAgdmFyIG5hbWVzID0gWydRdWFkJywgJ0N1YmljJywgJ1F1YXJ0JywgJ1F1aW50JywgJ0V4cG8nXTtcbiAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgU2luZTogZnVuY3Rpb24odCkgeyByZXR1cm4gMSArIE1hdGguc2luKE1hdGguUEkgLyAyICogdCAtIE1hdGguUEkgLyAyKTsgfSxcbiAgICAgIENpcmM6IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIDEgLSBNYXRoLnNxcnQoIDEgLSB0ICogdCApOyB9LFxuICAgICAgRWxhc3RpYzogZnVuY3Rpb24odCwgbSkge1xuICAgICAgICBpZiggdCA9PT0gMCB8fCB0ID09PSAxICkgcmV0dXJuIHQ7XG4gICAgICAgIHZhciBwID0gKDEgLSBNYXRoLm1pbihtLCA5OTgpIC8gMTAwMCksIHN0ID0gdCAvIDEsIHN0MSA9IHN0IC0gMSwgcyA9IHAgLyAoIDIgKiBNYXRoLlBJICkgKiBNYXRoLmFzaW4oIDEgKTtcbiAgICAgICAgcmV0dXJuIC0oIE1hdGgucG93KCAyLCAxMCAqIHN0MSApICogTWF0aC5zaW4oICggc3QxIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICk7XG4gICAgICB9LFxuICAgICAgQmFjazogZnVuY3Rpb24odCkgeyByZXR1cm4gdCAqIHQgKiAoIDMgKiB0IC0gMiApOyB9LFxuICAgICAgQm91bmNlOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBwb3cyLCBib3VuY2UgPSA0O1xuICAgICAgICB3aGlsZSAoIHQgPCAoICggcG93MiA9IE1hdGgucG93KCAyLCAtLWJvdW5jZSApICkgLSAxICkgLyAxMSApIHt9XG4gICAgICAgIHJldHVybiAxIC8gTWF0aC5wb3coIDQsIDMgLSBib3VuY2UgKSAtIDcuNTYyNSAqIE1hdGgucG93KCAoIHBvdzIgKiAzIC0gMiApIC8gMjIgLSB0LCAyICk7XG4gICAgICB9XG4gICAgfVxuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgaSkge1xuICAgICAgZnVuY3Rpb25zW25hbWVdID0gZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coIHQsIGkgKyAyICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMoZnVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBlYXNlSW4gPSBmdW5jdGlvbnNbbmFtZV07XG4gICAgICBlYXNlc1snZWFzZUluJyArIG5hbWVdID0gZWFzZUluO1xuICAgICAgZWFzZXNbJ2Vhc2VPdXQnICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiAxIC0gZWFzZUluKDEgLSB0LCBtKTsgfTtcbiAgICAgIGVhc2VzWydlYXNlSW5PdXQnICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiB0IDwgMC41ID8gZWFzZUluKHQgKiAyLCBtKSAvIDIgOiAxIC0gZWFzZUluKHQgKiAtMiArIDIsIG0pIC8gMjsgfTtcbiAgICAgIGVhc2VzWydlYXNlT3V0SW4nICsgbmFtZV0gPSBmdW5jdGlvbih0LCBtKSB7IHJldHVybiB0IDwgMC41ID8gKDEgLSBlYXNlSW4oMSAtIDIgKiB0LCBtKSkgLyAyIDogKGVhc2VJbih0ICogMiAtIDEsIG0pICsgMSkgLyAyOyB9O1xuICAgIH0pO1xuICAgIGVhc2VzLmxpbmVhciA9IGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQ7IH07XG4gICAgcmV0dXJuIGVhc2VzO1xuICB9KSgpO1xuXG4gIC8vIFN0cmluZ3NcblxuICB2YXIgbnVtYmVyVG9TdHJpbmcgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gKGlzLnN0cih2YWwpKSA/IHZhbCA6IHZhbCArICcnO1xuICB9XG5cbiAgdmFyIHN0cmluZ1RvSHlwaGVucyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHZhciBzZWxlY3RTdHJpbmcgPSBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoaXMuY29sKHN0cikpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgdmFyIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzdHIpO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE51bWJlcnNcblxuICB2YXIgcmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgfVxuXG4gIC8vIEFycmF5c1xuXG4gIHZhciBmbGF0dGVuQXJyYXkgPSBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gYXJyLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb25jYXQoaXMuYXJyKGIpID8gZmxhdHRlbkFycmF5KGIpIDogYik7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgdmFyIHRvQXJyYXkgPSBmdW5jdGlvbihvKSB7XG4gICAgaWYgKGlzLmFycihvKSkgcmV0dXJuIG87XG4gICAgaWYgKGlzLnN0cihvKSkgbyA9IHNlbGVjdFN0cmluZyhvKSB8fCBvO1xuICAgIGlmIChvIGluc3RhbmNlb2YgTm9kZUxpc3QgfHwgbyBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uKSByZXR1cm4gW10uc2xpY2UuY2FsbChvKTtcbiAgICByZXR1cm4gW29dO1xuICB9XG5cbiAgdmFyIGFycmF5Q29udGFpbnMgPSBmdW5jdGlvbihhcnIsIHZhbCkge1xuICAgIHJldHVybiBhcnIuc29tZShmdW5jdGlvbihhKSB7IHJldHVybiBhID09PSB2YWw7IH0pO1xuICB9XG5cbiAgdmFyIGdyb3VwQXJyYXlCeVByb3BzID0gZnVuY3Rpb24oYXJyLCBwcm9wc0Fycikge1xuICAgIHZhciBncm91cHMgPSB7fTtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgZ3JvdXAgPSBKU09OLnN0cmluZ2lmeShwcm9wc0Fyci5tYXAoZnVuY3Rpb24ocCkgeyByZXR1cm4gb1twXTsgfSkpO1xuICAgICAgZ3JvdXBzW2dyb3VwXSA9IGdyb3Vwc1tncm91cF0gfHwgW107XG4gICAgICBncm91cHNbZ3JvdXBdLnB1c2gobyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGdyb3VwcykubWFwKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICByZXR1cm4gZ3JvdXBzW2dyb3VwXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVBcnJheUR1cGxpY2F0ZXMgPSBmdW5jdGlvbihhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcihmdW5jdGlvbihpdGVtLCBwb3MsIHNlbGYpIHtcbiAgICAgIHJldHVybiBzZWxmLmluZGV4T2YoaXRlbSkgPT09IHBvcztcbiAgICB9KTtcbiAgfVxuXG4gIC8vIE9iamVjdHNcblxuICB2YXIgY2xvbmVPYmplY3QgPSBmdW5jdGlvbihvKSB7XG4gICAgdmFyIG5ld09iamVjdCA9IHt9O1xuICAgIGZvciAodmFyIHAgaW4gbykgbmV3T2JqZWN0W3BdID0gb1twXTtcbiAgICByZXR1cm4gbmV3T2JqZWN0O1xuICB9XG5cbiAgdmFyIG1lcmdlT2JqZWN0cyA9IGZ1bmN0aW9uKG8xLCBvMikge1xuICAgIGZvciAodmFyIHAgaW4gbzIpIG8xW3BdID0gIWlzLnVuZChvMVtwXSkgPyBvMVtwXSA6IG8yW3BdO1xuICAgIHJldHVybiBvMTtcbiAgfVxuXG4gIC8vIENvbG9yc1xuXG4gIHZhciBoZXhUb1JnYiA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHZhciByZ3ggPSAvXiM/KFthLWZcXGRdKShbYS1mXFxkXSkoW2EtZlxcZF0pJC9pO1xuICAgIHZhciBoZXggPSBoZXgucmVwbGFjZShyZ3gsIGZ1bmN0aW9uKG0sIHIsIGcsIGIpIHsgcmV0dXJuIHIgKyByICsgZyArIGcgKyBiICsgYjsgfSk7XG4gICAgdmFyIHJnYiA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIHZhciByID0gcGFyc2VJbnQocmdiWzFdLCAxNik7XG4gICAgdmFyIGcgPSBwYXJzZUludChyZ2JbMl0sIDE2KTtcbiAgICB2YXIgYiA9IHBhcnNlSW50KHJnYlszXSwgMTYpO1xuICAgIHJldHVybiAncmdiKCcgKyByICsgJywnICsgZyArICcsJyArIGIgKyAnKSc7XG4gIH1cblxuICB2YXIgaHNsVG9SZ2IgPSBmdW5jdGlvbihoc2wpIHtcbiAgICB2YXIgaHNsID0gL2hzbFxcKChcXGQrKSxcXHMqKFtcXGQuXSspJSxcXHMqKFtcXGQuXSspJVxcKS9nLmV4ZWMoaHNsKTtcbiAgICB2YXIgaCA9IHBhcnNlSW50KGhzbFsxXSkgLyAzNjA7XG4gICAgdmFyIHMgPSBwYXJzZUludChoc2xbMl0pIC8gMTAwO1xuICAgIHZhciBsID0gcGFyc2VJbnQoaHNsWzNdKSAvIDEwMDtcbiAgICB2YXIgaHVlMnJnYiA9IGZ1bmN0aW9uKHAsIHEsIHQpIHtcbiAgICAgIGlmICh0IDwgMCkgdCArPSAxO1xuICAgICAgaWYgKHQgPiAxKSB0IC09IDE7XG4gICAgICBpZiAodCA8IDEvNikgcmV0dXJuIHAgKyAocSAtIHApICogNiAqIHQ7XG4gICAgICBpZiAodCA8IDEvMikgcmV0dXJuIHE7XG4gICAgICBpZiAodCA8IDIvMykgcmV0dXJuIHAgKyAocSAtIHApICogKDIvMyAtIHQpICogNjtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICB2YXIgciwgZywgYjtcbiAgICBpZiAocyA9PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSBsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcSA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHM7XG4gICAgICB2YXIgcCA9IDIgKiBsIC0gcTtcbiAgICAgIHIgPSBodWUycmdiKHAsIHEsIGggKyAxLzMpO1xuICAgICAgZyA9IGh1ZTJyZ2IocCwgcSwgaCk7XG4gICAgICBiID0gaHVlMnJnYihwLCBxLCBoIC0gMS8zKTtcbiAgICB9XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKiAyNTUgKyAnLCcgKyBnICogMjU1ICsgJywnICsgYiAqIDI1NSArICcpJztcbiAgfVxuXG4gIHZhciBjb2xvclRvUmdiID0gZnVuY3Rpb24odmFsKSB7XG4gICAgaWYgKGlzLnJnYih2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChpcy5oZXgodmFsKSkgcmV0dXJuIGhleFRvUmdiKHZhbCk7XG4gICAgaWYgKGlzLmhzbCh2YWwpKSByZXR1cm4gaHNsVG9SZ2IodmFsKTtcbiAgfVxuXG4gIC8vIFVuaXRzXG5cbiAgdmFyIGdldFVuaXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gLyhbXFwrXFwtXT9bMC05fGF1dG9cXC5dKykoJXxweHxwdHxlbXxyZW18aW58Y218bW18ZXh8cGN8dnd8dmh8ZGVnKT8vLmV4ZWModmFsKVsyXTtcbiAgfVxuXG4gIHZhciBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdCA9IGZ1bmN0aW9uKHByb3AsIHZhbCwgaW50aWFsVmFsKSB7XG4gICAgaWYgKGdldFVuaXQodmFsKSkgcmV0dXJuIHZhbDtcbiAgICBpZiAocHJvcC5pbmRleE9mKCd0cmFuc2xhdGUnKSA+IC0xKSByZXR1cm4gZ2V0VW5pdChpbnRpYWxWYWwpID8gdmFsICsgZ2V0VW5pdChpbnRpYWxWYWwpIDogdmFsICsgJ3B4JztcbiAgICBpZiAocHJvcC5pbmRleE9mKCdyb3RhdGUnKSA+IC0xIHx8IHByb3AuaW5kZXhPZignc2tldycpID4gLTEpIHJldHVybiB2YWwgKyAnZGVnJztcbiAgICByZXR1cm4gdmFsO1xuICB9XG5cbiAgLy8gVmFsdWVzXG5cbiAgdmFyIGdldENTU1ZhbHVlID0gZnVuY3Rpb24oZWwsIHByb3ApIHtcbiAgICAvLyBGaXJzdCBjaGVjayBpZiBwcm9wIGlzIGEgdmFsaWQgQ1NTIHByb3BlcnR5XG4gICAgaWYgKHByb3AgaW4gZWwuc3R5bGUpIHtcbiAgICAgIC8vIFRoZW4gcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvciBmYWxsYmFjayB0byAnMCcgd2hlbiBnZXRQcm9wZXJ0eVZhbHVlIGZhaWxzXG4gICAgICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZShzdHJpbmdUb0h5cGhlbnMocHJvcCkpIHx8ICcwJztcbiAgICB9XG4gIH1cblxuICB2YXIgZ2V0VHJhbnNmb3JtVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIHZhciBkZWZhdWx0VmFsID0gcHJvcC5pbmRleE9mKCdzY2FsZScpID4gLTEgPyAxIDogMDtcbiAgICB2YXIgc3RyID0gZWwuc3R5bGUudHJhbnNmb3JtO1xuICAgIGlmICghc3RyKSByZXR1cm4gZGVmYXVsdFZhbDtcbiAgICB2YXIgcmd4ID0gLyhcXHcrKVxcKCguKz8pXFwpL2c7XG4gICAgdmFyIG1hdGNoID0gW107XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHdoaWxlIChtYXRjaCA9IHJneC5leGVjKHN0cikpIHtcbiAgICAgIHByb3BzLnB1c2gobWF0Y2hbMV0pO1xuICAgICAgdmFsdWVzLnB1c2gobWF0Y2hbMl0pO1xuICAgIH1cbiAgICB2YXIgdmFsID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbihmLCBpKSB7IHJldHVybiBwcm9wc1tpXSA9PT0gcHJvcDsgfSk7XG4gICAgcmV0dXJuIHZhbC5sZW5ndGggPyB2YWxbMF0gOiBkZWZhdWx0VmFsO1xuICB9XG5cbiAgdmFyIGdldEFuaW1hdGlvblR5cGUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiBhcnJheUNvbnRhaW5zKHZhbGlkVHJhbnNmb3JtcywgcHJvcCkpIHJldHVybiAndHJhbnNmb3JtJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKGVsLmdldEF0dHJpYnV0ZShwcm9wKSB8fCAoaXMuc3ZnKGVsKSAmJiBlbFtwcm9wXSkpKSByZXR1cm4gJ2F0dHJpYnV0ZSc7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIChwcm9wICE9PSAndHJhbnNmb3JtJyAmJiBnZXRDU1NWYWx1ZShlbCwgcHJvcCkpKSByZXR1cm4gJ2Nzcyc7XG4gICAgaWYgKCFpcy5udWwoZWxbcHJvcF0pICYmICFpcy51bmQoZWxbcHJvcF0pKSByZXR1cm4gJ29iamVjdCc7XG4gIH1cblxuICB2YXIgZ2V0SW5pdGlhbFRhcmdldFZhbHVlID0gZnVuY3Rpb24odGFyZ2V0LCBwcm9wKSB7XG4gICAgc3dpdGNoIChnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcCkpIHtcbiAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6IHJldHVybiBnZXRUcmFuc2Zvcm1WYWx1ZSh0YXJnZXQsIHByb3ApO1xuICAgICAgY2FzZSAnY3NzJzogcmV0dXJuIGdldENTU1ZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdhdHRyaWJ1dGUnOiByZXR1cm4gdGFyZ2V0LmdldEF0dHJpYnV0ZShwcm9wKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFtwcm9wXSB8fCAwO1xuICB9XG5cbiAgdmFyIGdldFZhbGlkVmFsdWUgPSBmdW5jdGlvbih2YWx1ZXMsIHZhbCwgb3JpZ2luYWxDU1MpIHtcbiAgICBpZiAoaXMuY29sKHZhbCkpIHJldHVybiBjb2xvclRvUmdiKHZhbCk7XG4gICAgaWYgKGdldFVuaXQodmFsKSkgcmV0dXJuIHZhbDtcbiAgICB2YXIgdW5pdCA9IGdldFVuaXQodmFsdWVzLnRvKSA/IGdldFVuaXQodmFsdWVzLnRvKSA6IGdldFVuaXQodmFsdWVzLmZyb20pO1xuICAgIGlmICghdW5pdCAmJiBvcmlnaW5hbENTUykgdW5pdCA9IGdldFVuaXQob3JpZ2luYWxDU1MpO1xuICAgIHJldHVybiB1bml0ID8gdmFsICsgdW5pdCA6IHZhbDtcbiAgfVxuXG4gIHZhciBkZWNvbXBvc2VWYWx1ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciByZ3ggPSAvLT9cXGQqXFwuP1xcZCsvZztcbiAgICByZXR1cm4ge1xuICAgICAgb3JpZ2luYWw6IHZhbCxcbiAgICAgIG51bWJlcnM6IG51bWJlclRvU3RyaW5nKHZhbCkubWF0Y2gocmd4KSA/IG51bWJlclRvU3RyaW5nKHZhbCkubWF0Y2gocmd4KS5tYXAoTnVtYmVyKSA6IFswXSxcbiAgICAgIHN0cmluZ3M6IG51bWJlclRvU3RyaW5nKHZhbCkuc3BsaXQocmd4KVxuICAgIH1cbiAgfVxuXG4gIHZhciByZWNvbXBvc2VWYWx1ZSA9IGZ1bmN0aW9uKG51bWJlcnMsIHN0cmluZ3MsIGluaXRpYWxTdHJpbmdzKSB7XG4gICAgcmV0dXJuIHN0cmluZ3MucmVkdWNlKGZ1bmN0aW9uKGEsIGIsIGkpIHtcbiAgICAgIHZhciBiID0gKGIgPyBiIDogaW5pdGlhbFN0cmluZ3NbaSAtIDFdKTtcbiAgICAgIHJldHVybiBhICsgbnVtYmVyc1tpIC0gMV0gKyBiO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQW5pbWF0YWJsZXNcblxuICB2YXIgZ2V0QW5pbWF0YWJsZXMgPSBmdW5jdGlvbih0YXJnZXRzKSB7XG4gICAgdmFyIHRhcmdldHMgPSB0YXJnZXRzID8gKGZsYXR0ZW5BcnJheShpcy5hcnIodGFyZ2V0cykgPyB0YXJnZXRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkodGFyZ2V0cykpKSA6IFtdO1xuICAgIHJldHVybiB0YXJnZXRzLm1hcChmdW5jdGlvbih0LCBpKSB7XG4gICAgICByZXR1cm4geyB0YXJnZXQ6IHQsIGlkOiBpIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBQcm9wZXJ0aWVzXG5cbiAgdmFyIGdldFByb3BlcnRpZXMgPSBmdW5jdGlvbihwYXJhbXMsIHNldHRpbmdzKSB7XG4gICAgdmFyIHByb3BzID0gW107XG4gICAgZm9yICh2YXIgcCBpbiBwYXJhbXMpIHtcbiAgICAgIGlmICghZGVmYXVsdFNldHRpbmdzLmhhc093blByb3BlcnR5KHApICYmIHAgIT09ICd0YXJnZXRzJykge1xuICAgICAgICB2YXIgcHJvcCA9IGlzLm9iaihwYXJhbXNbcF0pID8gY2xvbmVPYmplY3QocGFyYW1zW3BdKSA6IHt2YWx1ZTogcGFyYW1zW3BdfTtcbiAgICAgICAgcHJvcC5uYW1lID0gcDtcbiAgICAgICAgcHJvcHMucHVzaChtZXJnZU9iamVjdHMocHJvcCwgc2V0dGluZ3MpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByb3BzO1xuICB9XG5cbiAgdmFyIGdldFByb3BlcnRpZXNWYWx1ZXMgPSBmdW5jdGlvbih0YXJnZXQsIHByb3AsIHZhbHVlLCBpKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRvQXJyYXkoIGlzLmZuYyh2YWx1ZSkgPyB2YWx1ZSh0YXJnZXQsIGkpIDogdmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICBmcm9tOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzBdIDogZ2V0SW5pdGlhbFRhcmdldFZhbHVlKHRhcmdldCwgcHJvcCksXG4gICAgICB0bzogKHZhbHVlcy5sZW5ndGggPiAxKSA/IHZhbHVlc1sxXSA6IHZhbHVlc1swXVxuICAgIH1cbiAgfVxuXG4gIC8vIFR3ZWVuc1xuXG4gIHZhciBnZXRUd2VlblZhbHVlcyA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlcywgdHlwZSwgdGFyZ2V0KSB7XG4gICAgdmFyIHZhbGlkID0ge307XG4gICAgaWYgKHR5cGUgPT09ICd0cmFuc2Zvcm0nKSB7XG4gICAgICB2YWxpZC5mcm9tID0gcHJvcCArICcoJyArIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0KHByb3AsIHZhbHVlcy5mcm9tLCB2YWx1ZXMudG8pICsgJyknO1xuICAgICAgdmFsaWQudG8gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLnRvKSArICcpJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9yaWdpbmFsQ1NTID0gKHR5cGUgPT09ICdjc3MnKSA/IGdldENTU1ZhbHVlKHRhcmdldCwgcHJvcCkgOiB1bmRlZmluZWQ7XG4gICAgICB2YWxpZC5mcm9tID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy5mcm9tLCBvcmlnaW5hbENTUyk7XG4gICAgICB2YWxpZC50byA9IGdldFZhbGlkVmFsdWUodmFsdWVzLCB2YWx1ZXMudG8sIG9yaWdpbmFsQ1NTKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZnJvbTogZGVjb21wb3NlVmFsdWUodmFsaWQuZnJvbSksIHRvOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC50bykgfTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNQcm9wcyA9IGZ1bmN0aW9uKGFuaW1hdGFibGVzLCBwcm9wcykge1xuICAgIHZhciB0d2VlbnNQcm9wcyA9IFtdO1xuICAgIGFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSwgaSkge1xuICAgICAgdmFyIHRhcmdldCA9IGFuaW1hdGFibGUudGFyZ2V0O1xuICAgICAgcmV0dXJuIHByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICB2YXIgYW5pbVR5cGUgPSBnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcC5uYW1lKTtcbiAgICAgICAgaWYgKGFuaW1UeXBlKSB7XG4gICAgICAgICAgdmFyIHZhbHVlcyA9IGdldFByb3BlcnRpZXNWYWx1ZXModGFyZ2V0LCBwcm9wLm5hbWUsIHByb3AudmFsdWUsIGkpO1xuICAgICAgICAgIHZhciB0d2VlbiA9IGNsb25lT2JqZWN0KHByb3ApO1xuICAgICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzID0gYW5pbWF0YWJsZTtcbiAgICAgICAgICB0d2Vlbi50eXBlID0gYW5pbVR5cGU7XG4gICAgICAgICAgdHdlZW4uZnJvbSA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLmZyb207XG4gICAgICAgICAgdHdlZW4udG8gPSBnZXRUd2VlblZhbHVlcyhwcm9wLm5hbWUsIHZhbHVlcywgdHdlZW4udHlwZSwgdGFyZ2V0KS50bztcbiAgICAgICAgICB0d2Vlbi5yb3VuZCA9IChpcy5jb2wodmFsdWVzLmZyb20pIHx8IHR3ZWVuLnJvdW5kKSA/IDEgOiAwO1xuICAgICAgICAgIHR3ZWVuLmRlbGF5ID0gKGlzLmZuYyh0d2Vlbi5kZWxheSkgPyB0d2Vlbi5kZWxheSh0YXJnZXQsIGksIGFuaW1hdGFibGVzLmxlbmd0aCkgOiB0d2Vlbi5kZWxheSkgLyBhbmltYXRpb24uc3BlZWQ7XG4gICAgICAgICAgdHdlZW4uZHVyYXRpb24gPSAoaXMuZm5jKHR3ZWVuLmR1cmF0aW9uKSA/IHR3ZWVuLmR1cmF0aW9uKHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmR1cmF0aW9uKSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2VlbnNQcm9wcy5wdXNoKHR3ZWVuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHR3ZWVuc1Byb3BzO1xuICB9XG5cbiAgdmFyIGdldFR3ZWVucyA9IGZ1bmN0aW9uKGFuaW1hdGFibGVzLCBwcm9wcykge1xuICAgIHZhciB0d2VlbnNQcm9wcyA9IGdldFR3ZWVuc1Byb3BzKGFuaW1hdGFibGVzLCBwcm9wcyk7XG4gICAgdmFyIHNwbGl0dGVkUHJvcHMgPSBncm91cEFycmF5QnlQcm9wcyh0d2VlbnNQcm9wcywgWyduYW1lJywgJ2Zyb20nLCAndG8nLCAnZGVsYXknLCAnZHVyYXRpb24nXSk7XG4gICAgcmV0dXJuIHNwbGl0dGVkUHJvcHMubWFwKGZ1bmN0aW9uKHR3ZWVuUHJvcHMpIHtcbiAgICAgIHZhciB0d2VlbiA9IGNsb25lT2JqZWN0KHR3ZWVuUHJvcHNbMF0pO1xuICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSB0d2VlblByb3BzLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBwLmFuaW1hdGFibGVzIH0pO1xuICAgICAgdHdlZW4udG90YWxEdXJhdGlvbiA9IHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb247XG4gICAgICByZXR1cm4gdHdlZW47XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmV2ZXJzZVR3ZWVucyA9IGZ1bmN0aW9uKGFuaW0sIGRlbGF5cykge1xuICAgIGFuaW0udHdlZW5zLmZvckVhY2goZnVuY3Rpb24odHdlZW4pIHtcbiAgICAgIHZhciB0b1ZhbCA9IHR3ZWVuLnRvO1xuICAgICAgdmFyIGZyb21WYWwgPSB0d2Vlbi5mcm9tO1xuICAgICAgdmFyIGRlbGF5VmFsID0gYW5pbS5kdXJhdGlvbiAtICh0d2Vlbi5kZWxheSArIHR3ZWVuLmR1cmF0aW9uKTtcbiAgICAgIHR3ZWVuLmZyb20gPSB0b1ZhbDtcbiAgICAgIHR3ZWVuLnRvID0gZnJvbVZhbDtcbiAgICAgIGlmIChkZWxheXMpIHR3ZWVuLmRlbGF5ID0gZGVsYXlWYWw7XG4gICAgfSk7XG4gICAgYW5pbS5yZXZlcnNlZCA9IGFuaW0ucmV2ZXJzZWQgPyBmYWxzZSA6IHRydWU7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zRHVyYXRpb24gPSBmdW5jdGlvbih0d2VlbnMpIHtcbiAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgdHdlZW5zLm1hcChmdW5jdGlvbih0d2Vlbil7IHJldHVybiB0d2Vlbi50b3RhbER1cmF0aW9uOyB9KSk7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zRGVsYXkgPSBmdW5jdGlvbih0d2VlbnMpIHtcbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgdHdlZW5zLm1hcChmdW5jdGlvbih0d2Vlbil7IHJldHVybiB0d2Vlbi5kZWxheTsgfSkpO1xuICB9XG5cbiAgLy8gd2lsbC1jaGFuZ2VcblxuICB2YXIgZ2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgZWxzID0gW107XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgaWYgKHR3ZWVuLnR5cGUgPT09ICdjc3MnIHx8IHR3ZWVuLnR5cGUgPT09ICd0cmFuc2Zvcm0nICkge1xuICAgICAgICBwcm9wcy5wdXNoKHR3ZWVuLnR5cGUgPT09ICdjc3MnID8gc3RyaW5nVG9IeXBoZW5zKHR3ZWVuLm5hbWUpIDogJ3RyYW5zZm9ybScpO1xuICAgICAgICB0d2Vlbi5hbmltYXRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKGFuaW1hdGFibGUpIHsgZWxzLnB1c2goYW5pbWF0YWJsZS50YXJnZXQpOyB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcGVydGllczogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKHByb3BzKS5qb2luKCcsICcpLFxuICAgICAgZWxlbWVudHM6IHJlbW92ZUFycmF5RHVwbGljYXRlcyhlbHMpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNldFdpbGxDaGFuZ2UgPSBmdW5jdGlvbihhbmltKSB7XG4gICAgdmFyIHdpbGxDaGFuZ2UgPSBnZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgIHdpbGxDaGFuZ2UuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LnN0eWxlLndpbGxDaGFuZ2UgPSB3aWxsQ2hhbmdlLnByb3BlcnRpZXM7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgcmVtb3ZlV2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3dpbGwtY2hhbmdlJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBTdmcgcGF0aCAqL1xuXG4gIHZhciBnZXRQYXRoUHJvcHMgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdmFyIGVsID0gaXMuc3RyKHBhdGgpID8gc2VsZWN0U3RyaW5nKHBhdGgpWzBdIDogcGF0aDtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogZWwsXG4gICAgICB2YWx1ZTogZWwuZ2V0VG90YWxMZW5ndGgoKVxuICAgIH1cbiAgfVxuXG4gIHZhciBzbmFwUHJvZ3Jlc3NUb1BhdGggPSBmdW5jdGlvbih0d2VlbiwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgcGF0aEVsID0gdHdlZW4ucGF0aDtcbiAgICB2YXIgcGF0aFByb2dyZXNzID0gdHdlZW4udmFsdWUgKiBwcm9ncmVzcztcbiAgICB2YXIgcG9pbnQgPSBmdW5jdGlvbihvZmZzZXQpIHtcbiAgICAgIHZhciBvID0gb2Zmc2V0IHx8IDA7XG4gICAgICB2YXIgcCA9IHByb2dyZXNzID4gMSA/IHR3ZWVuLnZhbHVlICsgbyA6IHBhdGhQcm9ncmVzcyArIG87XG4gICAgICByZXR1cm4gcGF0aEVsLmdldFBvaW50QXRMZW5ndGgocCk7XG4gICAgfVxuICAgIHZhciBwID0gcG9pbnQoKTtcbiAgICB2YXIgcDAgPSBwb2ludCgtMSk7XG4gICAgdmFyIHAxID0gcG9pbnQoKzEpO1xuICAgIHN3aXRjaCAodHdlZW4ubmFtZSkge1xuICAgICAgY2FzZSAndHJhbnNsYXRlWCc6IHJldHVybiBwLng7XG4gICAgICBjYXNlICd0cmFuc2xhdGVZJzogcmV0dXJuIHAueTtcbiAgICAgIGNhc2UgJ3JvdGF0ZSc6IHJldHVybiBNYXRoLmF0YW4yKHAxLnkgLSBwMC55LCBwMS54IC0gcDAueCkgKiAxODAgLyBNYXRoLlBJO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByb2dyZXNzXG5cbiAgdmFyIGdldFR3ZWVuUHJvZ3Jlc3MgPSBmdW5jdGlvbih0d2VlbiwgdGltZSkge1xuICAgIHZhciBlbGFwc2VkID0gTWF0aC5taW4oTWF0aC5tYXgodGltZSAtIHR3ZWVuLmRlbGF5LCAwKSwgdHdlZW4uZHVyYXRpb24pO1xuICAgIHZhciBwZXJjZW50ID0gZWxhcHNlZCAvIHR3ZWVuLmR1cmF0aW9uO1xuICAgIHZhciBwcm9ncmVzcyA9IHR3ZWVuLnRvLm51bWJlcnMubWFwKGZ1bmN0aW9uKG51bWJlciwgcCkge1xuICAgICAgdmFyIHN0YXJ0ID0gdHdlZW4uZnJvbS5udW1iZXJzW3BdO1xuICAgICAgdmFyIGVhc2VkID0gZWFzaW5nc1t0d2Vlbi5lYXNpbmddKHBlcmNlbnQsIHR3ZWVuLmVsYXN0aWNpdHkpO1xuICAgICAgdmFyIHZhbCA9IHR3ZWVuLnBhdGggPyBzbmFwUHJvZ3Jlc3NUb1BhdGgodHdlZW4sIGVhc2VkKSA6IHN0YXJ0ICsgZWFzZWQgKiAobnVtYmVyIC0gc3RhcnQpO1xuICAgICAgdmFsID0gdHdlZW4ucm91bmQgPyBNYXRoLnJvdW5kKHZhbCAqIHR3ZWVuLnJvdW5kKSAvIHR3ZWVuLnJvdW5kIDogdmFsO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVjb21wb3NlVmFsdWUocHJvZ3Jlc3MsIHR3ZWVuLnRvLnN0cmluZ3MsIHR3ZWVuLmZyb20uc3RyaW5ncyk7XG4gIH1cblxuICB2YXIgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MgPSBmdW5jdGlvbihhbmltLCB0aW1lKSB7XG4gICAgdmFyIHRyYW5zZm9ybXM7XG4gICAgYW5pbS5jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgYW5pbS5wcm9ncmVzcyA9ICh0aW1lIC8gYW5pbS5kdXJhdGlvbikgKiAxMDA7XG4gICAgZm9yICh2YXIgdCA9IDA7IHQgPCBhbmltLnR3ZWVucy5sZW5ndGg7IHQrKykge1xuICAgICAgdmFyIHR3ZWVuID0gYW5pbS50d2VlbnNbdF07XG4gICAgICB0d2Vlbi5jdXJyZW50VmFsdWUgPSBnZXRUd2VlblByb2dyZXNzKHR3ZWVuLCB0aW1lKTtcbiAgICAgIHZhciBwcm9ncmVzcyA9IHR3ZWVuLmN1cnJlbnRWYWx1ZTtcbiAgICAgIGZvciAodmFyIGEgPSAwOyBhIDwgdHdlZW4uYW5pbWF0YWJsZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGUgPSB0d2Vlbi5hbmltYXRhYmxlc1thXTtcbiAgICAgICAgdmFyIGlkID0gYW5pbWF0YWJsZS5pZDtcbiAgICAgICAgdmFyIHRhcmdldCA9IGFuaW1hdGFibGUudGFyZ2V0O1xuICAgICAgICB2YXIgbmFtZSA9IHR3ZWVuLm5hbWU7XG4gICAgICAgIHN3aXRjaCAodHdlZW4udHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2Nzcyc6IHRhcmdldC5zdHlsZVtuYW1lXSA9IHByb2dyZXNzOyBicmVhaztcbiAgICAgICAgICBjYXNlICdhdHRyaWJ1dGUnOiB0YXJnZXQuc2V0QXR0cmlidXRlKG5hbWUsIHByb2dyZXNzKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnb2JqZWN0JzogdGFyZ2V0W25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCF0cmFuc2Zvcm1zKSB0cmFuc2Zvcm1zID0ge307XG4gICAgICAgICAgaWYgKCF0cmFuc2Zvcm1zW2lkXSkgdHJhbnNmb3Jtc1tpZF0gPSBbXTtcbiAgICAgICAgICB0cmFuc2Zvcm1zW2lkXS5wdXNoKHByb2dyZXNzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHJhbnNmb3Jtcykge1xuICAgICAgaWYgKCF0cmFuc2Zvcm0pIHRyYW5zZm9ybSA9IChnZXRDU1NWYWx1ZShkb2N1bWVudC5ib2R5LCB0cmFuc2Zvcm1TdHIpID8gJycgOiAnLXdlYmtpdC0nKSArIHRyYW5zZm9ybVN0cjtcbiAgICAgIGZvciAodmFyIHQgaW4gdHJhbnNmb3Jtcykge1xuICAgICAgICBhbmltLmFuaW1hdGFibGVzW3RdLnRhcmdldC5zdHlsZVt0cmFuc2Zvcm1dID0gdHJhbnNmb3Jtc1t0XS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQW5pbWF0aW9uXG5cbiAgdmFyIGNyZWF0ZUFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIHZhciBhbmltID0ge307XG4gICAgYW5pbS5hbmltYXRhYmxlcyA9IGdldEFuaW1hdGFibGVzKHBhcmFtcy50YXJnZXRzKTtcbiAgICBhbmltLnNldHRpbmdzID0gbWVyZ2VPYmplY3RzKHBhcmFtcywgZGVmYXVsdFNldHRpbmdzKTtcbiAgICBhbmltLnByb3BlcnRpZXMgPSBnZXRQcm9wZXJ0aWVzKHBhcmFtcywgYW5pbS5zZXR0aW5ncyk7XG4gICAgYW5pbS50d2VlbnMgPSBnZXRUd2VlbnMoYW5pbS5hbmltYXRhYmxlcywgYW5pbS5wcm9wZXJ0aWVzKTtcbiAgICBhbmltLmR1cmF0aW9uID0gYW5pbS50d2VlbnMubGVuZ3RoID8gZ2V0VHdlZW5zRHVyYXRpb24oYW5pbS50d2VlbnMpIDogcGFyYW1zLmR1cmF0aW9uO1xuICAgIGFuaW0uZGVsYXkgPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEZWxheShhbmltLnR3ZWVucykgOiBwYXJhbXMuZGVsYXk7XG4gICAgYW5pbS5jdXJyZW50VGltZSA9IDA7XG4gICAgYW5pbS5wcm9ncmVzcyA9IDA7XG4gICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgIHJldHVybiBhbmltO1xuICB9XG5cbiAgLy8gUHVibGljXG5cbiAgdmFyIGFuaW1hdGlvbnMgPSBbXTtcbiAgdmFyIHJhZiA9IDA7XG5cbiAgdmFyIGVuZ2luZSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGxheSA9IGZ1bmN0aW9uKCkgeyByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7IH07XG4gICAgdmFyIHN0ZXAgPSBmdW5jdGlvbih0KSB7XG4gICAgICBpZiAoYW5pbWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSBhbmltYXRpb25zW2ldLnRpY2sodCk7XG4gICAgICAgIHBsYXkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZik7XG4gICAgICAgIHJhZiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbGF5O1xuICB9KSgpO1xuXG4gIHZhciBhbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcblxuICAgIHZhciBhbmltID0gY3JlYXRlQW5pbWF0aW9uKHBhcmFtcyk7XG4gICAgdmFyIHRpbWUgPSB7fTtcblxuICAgIGFuaW0udGljayA9IGZ1bmN0aW9uKG5vdykge1xuICAgICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgICAgaWYgKCF0aW1lLnN0YXJ0KSB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgdGltZS5jdXJyZW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGltZS5sYXN0ICsgbm93IC0gdGltZS5zdGFydCwgMCksIGFuaW0uZHVyYXRpb24pO1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgdGltZS5jdXJyZW50KTtcbiAgICAgIHZhciBzID0gYW5pbS5zZXR0aW5ncztcbiAgICAgIGlmICh0aW1lLmN1cnJlbnQgPj0gYW5pbS5kZWxheSkge1xuICAgICAgICBpZiAocy5iZWdpbikgcy5iZWdpbihhbmltKTsgcy5iZWdpbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHMudXBkYXRlKSBzLnVwZGF0ZShhbmltKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lLmN1cnJlbnQgPj0gYW5pbS5kdXJhdGlvbikge1xuICAgICAgICBpZiAocy5sb29wKSB7XG4gICAgICAgICAgdGltZS5zdGFydCA9IG5vdztcbiAgICAgICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnKSByZXZlcnNlVHdlZW5zKGFuaW0sIHRydWUpO1xuICAgICAgICAgIGlmIChpcy5udW0ocy5sb29wKSkgcy5sb29wLS07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5pbS5lbmRlZCA9IHRydWU7XG4gICAgICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgICAgIGlmIChzLmNvbXBsZXRlKSBzLmNvbXBsZXRlKGFuaW0pO1xuICAgICAgICB9XG4gICAgICAgIHRpbWUubGFzdCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYW5pbS5zZWVrID0gZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcbiAgICAgIHNldEFuaW1hdGlvblByb2dyZXNzKGFuaW0sIChwcm9ncmVzcyAvIDEwMCkgKiBhbmltLmR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBhbmltLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZW1vdmVXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgdmFyIGkgPSBhbmltYXRpb25zLmluZGV4T2YoYW5pbSk7XG4gICAgICBpZiAoaSA+IC0xKSBhbmltYXRpb25zLnNwbGljZShpLCAxKTtcbiAgICB9XG5cbiAgICBhbmltLnBsYXkgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgIGlmIChwYXJhbXMpIGFuaW0gPSBtZXJnZU9iamVjdHMoY3JlYXRlQW5pbWF0aW9uKG1lcmdlT2JqZWN0cyhwYXJhbXMsIGFuaW0uc2V0dGluZ3MpKSwgYW5pbSk7XG4gICAgICB0aW1lLnN0YXJ0ID0gMDtcbiAgICAgIHRpbWUubGFzdCA9IGFuaW0uZW5kZWQgPyAwIDogYW5pbS5jdXJyZW50VGltZTtcbiAgICAgIHZhciBzID0gYW5pbS5zZXR0aW5ncztcbiAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ3JldmVyc2UnKSByZXZlcnNlVHdlZW5zKGFuaW0pO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJyAmJiAhcy5sb29wKSBzLmxvb3AgPSAxO1xuICAgICAgc2V0V2lsbENoYW5nZShhbmltKTtcbiAgICAgIGFuaW1hdGlvbnMucHVzaChhbmltKTtcbiAgICAgIGlmICghcmFmKSBlbmdpbmUoKTtcbiAgICB9XG5cbiAgICBhbmltLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhbmltLnJldmVyc2VkKSByZXZlcnNlVHdlZW5zKGFuaW0pO1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgYW5pbS5zZWVrKDApO1xuICAgICAgYW5pbS5wbGF5KCk7XG4gICAgfVxuXG4gICAgaWYgKGFuaW0uc2V0dGluZ3MuYXV0b3BsYXkpIGFuaW0ucGxheSgpO1xuXG4gICAgcmV0dXJuIGFuaW07XG5cbiAgfVxuXG4gIC8vIFJlbW92ZSBvbmUgb3IgbXVsdGlwbGUgdGFyZ2V0cyBmcm9tIGFsbCBhY3RpdmUgYW5pbWF0aW9ucy5cblxuICB2YXIgcmVtb3ZlID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IGZsYXR0ZW5BcnJheShpcy5hcnIoZWxlbWVudHMpID8gZWxlbWVudHMubWFwKHRvQXJyYXkpIDogdG9BcnJheShlbGVtZW50cykpO1xuICAgIGZvciAodmFyIGkgPSBhbmltYXRpb25zLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGFuaW1hdGlvbiA9IGFuaW1hdGlvbnNbaV07XG4gICAgICB2YXIgdHdlZW5zID0gYW5pbWF0aW9uLnR3ZWVucztcbiAgICAgIGZvciAodmFyIHQgPSB0d2VlbnMubGVuZ3RoLTE7IHQgPj0gMDsgdC0tKSB7XG4gICAgICAgIHZhciBhbmltYXRhYmxlcyA9IHR3ZWVuc1t0XS5hbmltYXRhYmxlcztcbiAgICAgICAgZm9yICh2YXIgYSA9IGFuaW1hdGFibGVzLmxlbmd0aC0xOyBhID49IDA7IGEtLSkge1xuICAgICAgICAgIGlmIChhcnJheUNvbnRhaW5zKHRhcmdldHMsIGFuaW1hdGFibGVzW2FdLnRhcmdldCkpIHtcbiAgICAgICAgICAgIGFuaW1hdGFibGVzLnNwbGljZShhLCAxKTtcbiAgICAgICAgICAgIGlmICghYW5pbWF0YWJsZXMubGVuZ3RoKSB0d2VlbnMuc3BsaWNlKHQsIDEpO1xuICAgICAgICAgICAgaWYgKCF0d2VlbnMubGVuZ3RoKSBhbmltYXRpb24ucGF1c2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhbmltYXRpb24udmVyc2lvbiA9IHZlcnNpb247XG4gIGFuaW1hdGlvbi5zcGVlZCA9IDE7XG4gIGFuaW1hdGlvbi5saXN0ID0gYW5pbWF0aW9ucztcbiAgYW5pbWF0aW9uLnJlbW92ZSA9IHJlbW92ZTtcbiAgYW5pbWF0aW9uLmVhc2luZ3MgPSBlYXNpbmdzO1xuICBhbmltYXRpb24uZ2V0VmFsdWUgPSBnZXRJbml0aWFsVGFyZ2V0VmFsdWU7XG4gIGFuaW1hdGlvbi5wYXRoID0gZ2V0UGF0aFByb3BzO1xuICBhbmltYXRpb24ucmFuZG9tID0gcmFuZG9tO1xuXG4gIHJldHVybiBhbmltYXRpb247XG5cbn0pKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hbmltZWpzL2FuaW1lLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG4vKipcclxuICogR2FtZSBsb2dpYyBmb3IgY29udHJvbGxpbmcgYS1mcmFtZSBhY3Rpb25zIHN1Y2ggYXMgdGVsZXBvcnQgYW5kIHNhdmVcclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYWN0aW9uLWNvbnRyb2xzJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgbWVudUlEOiB7dHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJtZW51XCJ9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGlmIGNvbXBvbmVudCBuZWVkcyBtdWx0aXBsZSBpbnN0YW5jaW5nLlxyXG4gICAqL1xyXG4gIG11bHRpcGxlOiBmYWxzZSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gZ2V0IG1lbnUgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlc2UgY29udHJvbHNcclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25BY3Rpb25DaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgICBtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcignbWVudVNlbGVjdGVkJywgdGhpcy5vbkFjdGlvblNlbGVjdC5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICBtZW51RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uQWN0aW9uQ2hhbmdlKTtcclxuICAgIC8vIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKFwiYWN0aW9uLWNvbnRyb2xzOiBtZW51IGVsZW1lbnQ6IFwiICsgbWVudUVsKTtcclxuICAgIC8vIGdldCBjdXJyZW50bHkgc2VsZWN0ZWQgYWN0aW9uXHJcbiAgICB2YXIgb3B0aW9uVmFsdWUgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm9wdGlvblZhbHVlXCIgKyBvcHRpb25WYWx1ZSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25WYWx1ZSk7XHJcblxyXG4gICAgLy8gZG8gdGhlIHRoaW5nIGFzc29jaWF0ZWQgd2l0aCB0aGUgYWN0aW9uXHJcbiAgICB0aGlzLmhhbmRsZUFjdGlvblN0YXJ0KG9wdGlvblZhbHVlKTtcclxuICB9LFxyXG5cclxuICBvbkFjdGlvblNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gd2hhdCBpcyB0aGUgYWN0aW9uXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcblxyXG5cclxuICAgIC8vIGdldCBjdXJyZW50bHkgc2VsZWN0ZWQgYWN0aW9uXHJcbiAgICB2YXIgb3B0aW9uVmFsdWUgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIm9uQWN0aW9uU2VsZWN0IHRyaWdnZXJlZDsgY3VycmVudCBvcHRpb25WYWx1ZTpcXG5cIik7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhvcHRpb25WYWx1ZSk7XHJcbiAgICAvLyBjYWxsIHRoZSB0aGluZyB0aGF0IGRvZXMgaXRcclxuXHJcbiAgICBzd2l0Y2ggKG9wdGlvblZhbHVlKSB7XHJcbiAgICAgIGNhc2UgXCJzYXZlXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlIHJlcXVlc3RlZFwiKTtcclxuICAgICAgICBzYXZlQnV0dG9uKHtvdmVyd3JpdGU6IHRydWV9KTtcclxuICAgICAgICByZXR1cm47IC8vIHdpdGhvdXQgdGhpcyByZXR1cm4gdGhlIG90aGVyIGNhc2VzIGFyZSBmaXJlZCAtIHdlaXJkIVxyXG4gICAgICBjYXNlIFwic2F2ZUFzXCI6XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzYXZlQXMgcmVxdWVzdGVkXCIpO1xyXG4gICAgICAgIHNhdmVCdXR0b24oKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJuZXdcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm5ldyByZXF1ZXN0ZWRcIik7XHJcbiAgICAgICAgdmFyIGNpdHlFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2l0eVwiKTtcclxuICAgICAgICB3aGlsZSAoY2l0eUVsLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgIGNpdHlFbC5yZW1vdmVDaGlsZChjaXR5RWwuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikuc2V0QXR0cmlidXRlKFwidGV4dF9fY2l0eW5hbWVcIiwgXCJ2YWx1ZVwiLCBcIiNOZXdDaXR5XCIpXHJcbiAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBcImFmcmFtZS5jaXR5XCI7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwidW5kb1wiOlxyXG4gICAgICAgIC8vIGZpbmQgZWxlbWVudCB3aXRoIFwiYnVpbGRlci1jb250cm9sc1wiIGF0dHJpYnV0ZVxyXG4gICAgICAgIC8vIGZpcmUgdGhlIG9uVW5kbyBldmVudFxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EtZW50aXR5W2J1aWxkZXItY29udHJvbHNdJylbMF0uY29tcG9uZW50c1snYnVpbGRlci1jb250cm9scyddLm9uVW5kbygpO1xyXG4vLyAgICAgICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4vLyAgICAgICAgdmFyIHVuZG9SZXN1bHQgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0aW9uVmFsdWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwiZXhpdFwiOlxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Etc2NlbmUnKS5leGl0VlIoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgb25BY3Rpb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIHVuZG8gb2xkIG9uZVxyXG4gICAgdGhpcy5oYW5kbGVBY3Rpb25FbmQodGhpcy5wcmV2aW91c0FjdGlvbik7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4gICAgLy8gZ2V0IGN1cnJlbnRseSBzZWxlY3RlZCBhY3Rpb25cclxuICAgIHZhciBvcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwibmV3IG9wdGlvblZhbHVlOiBcIiArIG9wdGlvblZhbHVlKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvblZhbHVlKTtcclxuICAgIC8vIGRvIG5ldyBvbmVcclxuICAgIHRoaXMuaGFuZGxlQWN0aW9uU3RhcnQob3B0aW9uVmFsdWUpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSByZXN1bWVzLlxyXG4gICAqIFVzZSB0byBjb250aW51ZSBvciBhZGQgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwbGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHBhdXNlcy5cclxuICAgKiBVc2UgdG8gc3RvcCBvciByZW1vdmUgYW55IGR5bmFtaWMgb3IgYmFja2dyb3VuZCBiZWhhdmlvciBzdWNoIGFzIGV2ZW50cy5cclxuICAgKi9cclxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGEgY29tcG9uZW50IGlzIHJlbW92ZWQgKGUuZy4sIHZpYSByZW1vdmVBdHRyaWJ1dGUpLlxyXG4gICAqIEdlbmVyYWxseSB1bmRvZXMgYWxsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGVudGl0eS5cclxuICAgKi9cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICBoYW5kbGVBY3Rpb25TdGFydDogZnVuY3Rpb24ob3B0aW9uVmFsdWUpIHtcclxuICAgIHRoaXMucHJldmlvdXNBY3Rpb24gPSBvcHRpb25WYWx1ZTtcclxuICAgIHZhciBjb250cm9sRWwgPSB0aGlzLmVsO1xyXG5cclxuICAgIC8vIGZvciBnaXZlbiBvcHRpb25WYWx1ZSwgZG8gc29tZXRoaW5nXHJcbiAgICBzd2l0Y2ggKG9wdGlvblZhbHVlKSB7XHJcblxyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjogICAgICAgIC8vIGFkZCB0ZWxlcG9ydCBjb21wb25lbnQgdG8gdGhlIGNvbnRyb2wgZWxlbWVudCB0aGF0IGlzIHRoZSBwYXJlbnQgb2YgdGhpcyBtZW51XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZWxlcG9ydFN0YXJ0XCIpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYXR0cmlidXRlIGZyb20gdGhpcyBodG1sOiB0ZWxlcG9ydC1jb250cm9scz1cImJ1dHRvbjogdHJpZ2dlcjsgY29sbGlzaW9uRW50aXRpZXM6ICNncm91bmRcIlxyXG4gICAgICAgIGNvbnRyb2xFbC5zZXRBdHRyaWJ1dGUoXCJ0ZWxlcG9ydC1jb250cm9sc1wiLCBcImJ1dHRvbjogdHJpZ2dlcjsgY29sbGlzaW9uRW50aXRpZXM6ICNncm91bmRcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwiZXJhc2VcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcImVyYXNlU3RhcnRcIik7XHJcbiAgICAgICAgLy8gYWRkIGF0dHJpYnV0ZSBmb3IgcmF5Y2FzdGVyIGN1cnNvciBmb3Igc2VsZWN0aW5nIG9iamVjdCB0byBkZWxldGUgaHR0cHM6Ly9naXRodWIuY29tL2JyeWlrL2FmcmFtZS1jb250cm9sbGVyLWN1cnNvci1jb21wb25lbnRcclxuICAgICAgICBjb250cm9sRWwuc2V0QXR0cmlidXRlKFwiY29udHJvbGxlci1jdXJzb3JcIiwgXCJjb2xvcjogcmVkXCIpO1xyXG4gICAgICAgIGNvbnRyb2xFbC5zZXRBdHRyaWJ1dGUoXCJyYXljYXN0ZXJcIiwgXCJvYmplY3RzOiAub2JqZWN0XCIpO1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgbGlzdGVuZXIgZm9yIG1vdXNlIGRvd24gZXZlbnQgb24gdGhpcyBlbGVtZW50OlxyXG4gICAgICAgIGNvbnRyb2xFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdJIHdhcyBjbGlja2VkIGF0OiAnLCBldnQuZGV0YWlsLmludGVyc2VjdGlvbi5wb2ludCk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhldnQuZGV0YWlsKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZXJhc2UgcmVxdWVzdGVkIChjbGljayBldmVudCBmaXJlZCBvbiBjb250cm9sRWwpXCIpO1xyXG4vLyAgICAgICAgICBjb25zb2xlLmxvZyhldnQuZGV0YWlsLmludGVyc2VjdGVkRWwpO1xyXG4gICAgICAgICAgLy8gZXZ0LmRldGFpbC5pbnRlcnNlY3RlZEVsLnNldEF0dHJpYnV0ZShcInZpc2libGVcIiwgXCJmYWxzZVwiKTtcclxuICAgICAgICAgIGV2dC5kZXRhaWwuaW50ZXJzZWN0ZWRFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGV2dC5kZXRhaWwuaW50ZXJzZWN0ZWRFbCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgY29udHJvbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnSSB3YXMgY2xpY2tlZCBhdDogJywgZXZ0LmRldGFpbC5pbnRlcnNlY3Rpb24ucG9pbnQpO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZXZ0LmRldGFpbCk7XHJcbiAgICAgICAgICAvLyBOT1RFOiB0aGlzIGRvZXMgbm90IGFwcGVhciB0byBiZSBmaXJpbmdcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTU9VU0VFTlRFUiBldmVudCBmaXJlZCBvbiBjb250cm9sRWxcIik7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhldnQuZGV0YWlsLmludGVyc2VjdGVkRWwpO1xyXG4gICAgICAgICAgZXZ0LmRldGFpbC5pbnRlcnNlY3RlZEVsLnNldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIsIFwiY29sb3JcIiwgXCJyZWRcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gbW9uaXRvciBmb3IgZXZlbnQgd2hlbiB0aGUgY29udHJvbEVsIGN1cnNvciBlbWl0czpcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgaGFuZGxlQWN0aW9uRW5kOiBmdW5jdGlvbihvcHRpb25WYWx1ZSkge1xyXG4gICAgdmFyIGNvbnRyb2xFbCA9IHRoaXMuZWw7XHJcblxyXG4gICAgLy8gZm9yIGdpdmVuIG9wdGlvblZhbHVlLCBkbyBzb21ldGhpbmdcclxuICAgIHN3aXRjaCAob3B0aW9uVmFsdWUpIHtcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6ICAgICAgICAvLyByZW1vdmUgdGVsZXBvcnQgY29tcG9uZW50XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZWxlcG9ydEVuZFwiKTtcclxuICAgICAgICBjb250cm9sRWwucmVtb3ZlQXR0cmlidXRlKFwidGVsZXBvcnQtY29udHJvbHNcIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBjYXNlIFwiZXJhc2VcIjpcclxuICAgICAgICBjb250cm9sRWwucmVtb3ZlQXR0cmlidXRlKFwicmF5Y2FzdGVyXCIpO1xyXG4gICAgICAgIGNvbnRyb2xFbC5yZW1vdmVBdHRyaWJ1dGUoXCJjb250cm9sbGVyLWN1cnNvclwiKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImVyYXNlRW5kXCIpO1xyXG4gICAgICAgIGNvbnRyb2xFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHt9ICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9hY3Rpb24tY29udHJvbHMuanMiLCIvKiBnbG9iYWwgQUZSQU1FICovXHJcblxyXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBhdHRlbXB0ZWQgdG8gcmVnaXN0ZXIgYmVmb3JlIEFGUkFNRSB3YXMgYXZhaWxhYmxlLicpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBodW1hbml6ZShzdHIpIHtcclxuICB2YXIgZnJhZ3MgPSBzdHIuc3BsaXQoJ18nKTtcclxuICB2YXIgaT0wO1xyXG4gIGZvciAoaT0wOyBpPGZyYWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBmcmFnc1tpXSA9IGZyYWdzW2ldLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZnJhZ3NbaV0uc2xpY2UoMSk7XHJcbiAgfVxyXG4gIHJldHVybiBmcmFncy5qb2luKCcgJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWaXZlIENvbnRyb2xsZXIgVGVtcGxhdGUgY29tcG9uZW50IGZvciBBLUZyYW1lLlxyXG4gKiBNb2RpZmVkIGZyb20gQS1GcmFtZSBEb21pbm9lcy5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYnVpbGRlci1jb250cm9scycsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIG1lbnVJZDoge3R5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHQ6IFwibWVudVwifVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBpZiBjb21wb25lbnQgbmVlZHMgbXVsdGlwbGUgaW5zdGFuY2luZy5cclxuICAgKi9cclxuICBtdWx0aXBsZTogZmFsc2UsXHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IGNvbnRyb2xsZXIgZnVudGlvbiBub3QgY292ZXJlZCBieSBzZWxlY3QgbWVudSBjb21wb25lbnRcclxuICAgIC8vIEFwcGxpY2FibGUgdG8gYm90aCBWaXZlIGFuZCBPY3VsdXMgVG91Y2ggY29udHJvbHNcclxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2dyaXBkb3duJywgdGhpcy5vblVuZG8uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gdGhlIHJlc3Qgb2YgdGhlIGNvbnRyb2xzIGFyZSBoYW5kbGVkIGJ5IHRoZSBtZW51IGVsZW1lbnRcclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlkKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25PYmplY3RDaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgICBtZW51RWwuYWRkRXZlbnRMaXN0ZW5lcignbWVudVNlbGVjdGVkJywgdGhpcy5vblBsYWNlT2JqZWN0LmJpbmQodGhpcykpO1xyXG5cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kbyk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG4gICAgbWVudUVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbk9iamVjdENoYW5nZSk7XHJcbiAgICBtZW51RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudVNlbGVjdGVkJywgdGhpcy5vblBsYWNlT2JqZWN0KTtcclxuXHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBnZXQgdGhlIGxpc3Qgb2Ygb2JqZWN0IGdyb3VwIGpzb24gZGlyZWN0b3JpZXMgLSB3aGljaCBqc29uIGZpbGVzIHNob3VsZCB3ZSByZWFkP1xyXG4gICAgICAvLyBmb3IgZWFjaCBncm91cCwgZmV0Y2ggdGhlIGpzb24gZmlsZSBhbmQgcG9wdWxhdGUgdGhlIG9wdGdyb3VwIGFuZCBvcHRpb24gZWxlbWVudHMgYXMgY2hpbGRyZW4gb2YgdGhlIGFwcHJvcHJpYXRlIG1lbnUgZWxlbWVudFxyXG4gICAgICB2YXIgbGlzdCA9IFtcImtmYXJyX2Jhc2VzXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX3ZlaFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9ibGRcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fY2hyXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX2FsaWVuXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX3NjZW5lXCJcclxuICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgIHZhciBncm91cEpTT05BcnJheSA9IFtdO1xyXG4gICAgICBjb25zdCBtZW51SWQgPSB0aGlzLmRhdGEubWVudUlkO1xyXG4gICAgICBjb25zb2xlLmxvZyhcImJ1aWxkZXItY29udHJvbHMgbWVudUlkOiBcIiArIG1lbnVJZCk7XHJcblxyXG4gICAgICAvLyBUT0RPOiB3cmFwIHRoaXMgaW4gcHJvbWlzZSBhbmQgdGhlbiByZXF1ZXN0IGFmcmFtZS1zZWxlY3QtYmFyIGNvbXBvbmVudCB0byByZS1pbml0IHdoZW4gZG9uZSBsb2FkaW5nXHJcbiAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXBOYW1lLCBpbmRleCkge1xyXG4gICAgICAgIC8vIGV4Y2VsbGVudCByZWZlcmVuY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTGVhcm4vSmF2YVNjcmlwdC9PYmplY3RzL0pTT05cclxuICAgICAgICB2YXIgcmVxdWVzdFVSTCA9ICdhc3NldHMvJyArIGdyb3VwTmFtZSArIFwiLmpzb25cIjtcclxuICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgcmVxdWVzdFVSTCk7XHJcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnanNvbic7XHJcbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XHJcblxyXG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vIGZvciBlYWNoIGdyb3VwbGlzdCBqc29uIGZpbGUgd2hlbiBsb2FkZWRcclxuICAgICAgICAgIGdyb3VwSlNPTkFycmF5W2dyb3VwTmFtZV0gPSByZXF1ZXN0LnJlc3BvbnNlO1xyXG4gICAgICAgICAgLy8gbGl0ZXJhbGx5IGFkZCB0aGlzIHNoaXQgdG8gdGhlIGRvbSBkdWRlXHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhncm91cEpTT05BcnJheVtncm91cE5hbWVdKTtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZ3JvdXBOYW1lOiBcIiArIGdyb3VwTmFtZSk7XHJcblxyXG4gICAgICAgICAgLy8gZmluZCB0aGUgb3B0Z3JvdXAgcGFyZW50IGVsZW1lbnQgLSB0aGUgbWVudSBvcHRpb24/XHJcbiAgICAgICAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobWVudUlkKTtcclxuXHJcbiAgICAgICAgICAvLyBhZGQgdGhlIHBhcmVudCBvcHRncm91cCBub2RlIGxpa2U6IDxvcHRncm91cCBsYWJlbD1cIkFsaWVuc1wiIHZhbHVlPVwibW1tbV9hbGllblwiPlxyXG4gICAgICAgICAgdmFyIG5ld09wdGdyb3VwRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0Z3JvdXBcIik7XHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIGh1bWFuaXplKGdyb3VwTmFtZSkpOyAvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBhIHByZXR0aWVyIGxhYmVsLCBub3QgdGhlIGZpbGVuYW1lXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIGdyb3VwTmFtZSk7XHJcblxyXG4gICAgICAgICAgLy8gY3JlYXRlIGVhY2ggY2hpbGRcclxuICAgICAgICAgIHZhciBvcHRpb25zSFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICBncm91cEpTT05BcnJheVtncm91cE5hbWVdLmZvckVhY2goIGZ1bmN0aW9uKG9iamVjdERlZmluaXRpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgIG9wdGlvbnNIVE1MICs9IGA8b3B0aW9uIHZhbHVlPVwiJHtvYmplY3REZWZpbml0aW9uW1wiZmlsZVwiXX1cIiBzcmM9XCJhc3NldHMvcHJldmlldy8ke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfS5qcGdcIj4ke2h1bWFuaXplKG9iamVjdERlZmluaXRpb25bXCJmaWxlXCJdKX08L29wdGlvbj5gXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBuZXdPcHRncm91cEVsLmlubmVySFRNTCA9IG9wdGlvbnNIVE1MO1xyXG4gICAgICAgICAgLy8gVE9ETzogQkFEIFdPUktBUk9VTkQgVE8gTk9UIFJFTE9BRCBCQVNFUyBzaW5jZSBpdCdzIGRlZmluZWQgaW4gSFRNTC4gSW5zdGVhZCwgbm8gb2JqZWN0cyBzaG91bGQgYmUgbGlzdGVkIGluIEhUTUwuIFRoaXMgc2hvdWxkIHVzZSBhIHByb21pc2UgYW5kIHRoZW4gaW5pdCB0aGUgc2VsZWN0LWJhciBjb21wb25lbnQgb25jZSBhbGwgb2JqZWN0cyBhcmUgbGlzdGVkLlxyXG4gICAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBcImtmYXJyX2Jhc2VzXCIpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZyAtIGRvbid0IGFwcGVuZCB0aGlzIHRvIHRoZSBET00gYmVjYXVzZSBvbmUgaXMgYWxyZWFkeSB0aGVyZVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWVudUVsLmFwcGVuZENoaWxkKG5ld09wdGdyb3VwRWwpO1xyXG4gICAgICAgICAgfVxyXG4vLyAgICAgICAgICByZXNvbHZlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLmdyb3VwSlNPTkFycmF5ID0gZ3JvdXBKU09OQXJyYXk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFNwYXducyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG9iamVjdCBhdCB0aGUgY29udHJvbGxlciBsb2NhdGlvbiB3aGVuIHRyaWdnZXIgcHJlc3NlZFxyXG4gICAqL1xyXG4gIG9uUGxhY2VPYmplY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgSXRlbSBlbGVtZW50ICh0aGUgcGxhY2VhYmxlIGNpdHkgb2JqZWN0KSBzZWxlY3RlZCBvbiB0aGlzIGNvbnRyb2xsZXJcclxuICAgIHZhciB0aGlzSXRlbUlEID0gKHRoaXMuZWwuaWQgPT09ICdsZWZ0Q29udHJvbGxlcicpID8gJyNsZWZ0SXRlbSc6JyNyaWdodEl0ZW0nO1xyXG4gICAgdmFyIHRoaXNJdGVtRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNJdGVtSUQpO1xyXG5cclxuICAgIC8vIFdoaWNoIG9iamVjdCBzaG91bGQgYmUgcGxhY2VkIGhlcmU/IFRoaXMgSUQgaXMgXCJzdG9yZWRcIiBpbiB0aGUgRE9NIGVsZW1lbnQgb2YgdGhlIGN1cnJlbnQgSXRlbVxyXG5cdFx0dmFyIG9iamVjdElkID0gcGFyc2VJbnQodGhpc0l0ZW1FbC5hdHRyaWJ1dGVzLm9iamVjdElkLnZhbHVlKTtcclxuXHJcbiAgICAvLyBXaGF0J3MgdGhlIHR5cGUgb2Ygb2JqZWN0PyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcblx0XHR2YXIgb2JqZWN0R3JvdXAgPSB0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0R3JvdXAudmFsdWU7XHJcblxyXG4gICAgLy8gcm91bmRpbmcgdHJ1ZSBvciBmYWxzZT8gV2Ugd2FudCB0byByb3VuZCBwb3NpdGlvbiBhbmQgcm90YXRpb24gb25seSBmb3IgXCJiYXNlc1wiIHR5cGUgb2JqZWN0c1xyXG4gICAgdmFyIHJvdW5kaW5nID0gKG9iamVjdEdyb3VwID09ICdrZmFycl9iYXNlcycpO1xyXG5cclxuICAgIC8vIEdldCBhbiBBcnJheSBvZiBhbGwgdGhlIG9iamVjdHMgb2YgdGhpcyB0eXBlXHJcbiAgICB2YXIgb2JqZWN0QXJyYXkgPSB0aGlzLmdyb3VwSlNPTkFycmF5W29iamVjdEdyb3VwXTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIEl0ZW0ncyBjdXJyZW50IHdvcmxkIGNvb3JkaW5hdGVzIC0gd2UncmUgZ29pbmcgdG8gcGxhY2UgaXQgcmlnaHQgd2hlcmUgaXQgaXMhXHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uID0gdGhpc0l0ZW1FbC5vYmplY3QzRC5nZXRXb3JsZFJvdGF0aW9uKCk7XHJcblx0XHR2YXIgb3JpZ2luYWxQb3NpdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRQb3NpdGlvbi54ICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnkgKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24uejtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHBvc2l0aW9uIHRvIHRoZSBuZWFyZXN0IDAuNTAgZm9yIGEgYmFzaWMgXCJncmlkIHNuYXBwaW5nXCIgZWZmZWN0XHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblogPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi56ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZFBvc2l0aW9uU3RyaW5nID0gcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWCArICcgMC41MCAnICsgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWjtcclxuXHJcbiAgICAvLyBGZXRjaCB0aGUgY3VycmVudCBJdGVtJ3Mgcm90YXRpb24gYW5kIGNvbnZlcnQgaXQgdG8gYSBFdWxlciBzdHJpbmdcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25YID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl94IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3kgLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWiA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feiAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcgPSB0aGlzSXRlbVdvcmxkUm90YXRpb25YICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIHRoaXNJdGVtV29ybGRSb3RhdGlvblo7XHJcblxyXG4gICAgLy8gUm91bmQgdGhlIEl0ZW0ncyByb3RhdGlvbiB0byB0aGUgbmVhcmVzdCA5MCBkZWdyZWVzIGZvciBiYXNlIHR5cGUgb2JqZWN0c1xyXG5cdFx0dmFyIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUm90YXRpb25ZIC8gOTApICogOTA7IC8vIHJvdW5kIHRvIDkwIGRlZ3JlZXNcclxuXHRcdHZhciByb3VuZGVkRXVsZXJSb3RhdGlvblN0cmluZyA9IDAgKyAnICcgKyByb3VuZGVkVGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSArICcgJyArIDA7IC8vIGlnbm9yZSByb2xsIGFuZCBwaXRjaFxyXG5cclxuICAgIC8vIE9MRCB2YXIgbmV3SWQgPSAnb2JqZWN0JyArIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaXR5JykuY2hpbGRFbGVtZW50Q291bnQ7XHJcbiAgICAvLyBORVcgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2NyZWF0ZS1ndWlkLXV1aWQtaW4tamF2YXNjcmlwdFxyXG4gICAgdmFyIG5ld0lkID0gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7dmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsdj1jPT0neCc/cjpyJjB4M3wweDg7cmV0dXJuIHYudG9TdHJpbmcoMTYpO30pO1xyXG4gICAgY29uc29sZS5sb2coXCJuZXdJZDpcIiArIG5ld0lkKTtcclxuICAgICQoJzxhLWVudGl0eSAvPicsIHtcclxuICAgICAgaWQ6IG5ld0lkLFxyXG4gICAgICBjbGFzczogJ2NpdHkgb2JqZWN0IGNoaWxkcmVuJyxcclxuICAgICAgc2NhbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgcm90YXRpb246IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgIGZpbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAvLyBcInBseS1tb2RlbFwiOiBcInNyYzogdXJsKG5ld19hc3NldHMvXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLnBseSlcIixcclxuICAgICAgXCJvYmotbW9kZWxcIjogXCJvYmo6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopOyBtdGw6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCIsXHJcbiAgICAgIGFwcGVuZFRvIDogJCgnI2NpdHknKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG5ld09iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5ld0lkKTtcclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblwiLCByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcpOyAvLyB0aGlzIGRvZXMgc2V0IHBvc2l0aW9uXHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIFwiYmFzZXNcIiB0eXBlIG9iamVjdCwgYW5pbWF0ZSB0aGUgdHJhbnNpdGlvbiB0byB0aGUgc25hcHBlZCAocm91bmRlZCkgcG9zaXRpb24gYW5kIHJvdGF0aW9uXHJcbiAgICBpZiAocm91bmRpbmcpIHtcclxuICAgICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3JvdGF0aW9uJywgZHVyOiA1MDAsIGZyb206IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZywgdG86IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGFub255bW91cyB0cmFja2luZyB1c2luZyBhbXBsaXR1ZGUuY29tLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2tmYXJyL2FmcmFtZS1jaXR5LWJ1aWxkZXIvaXNzdWVzLzE5XHJcbiAgICB2YXIgYW1wRXZlbnRQcm9wZXJ0aWVzID0ge1xyXG4gICAgICAnZmlsZSc6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAncG9zaXRpb24nOiByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcsXHJcbiAgICAgICdyb3RhdGlvbic6IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgICdzY2FsZSc6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgJ2lkJzogbmV3SWRcclxuICAgIH07XHJcbiAgICBhbXBsaXR1ZGUuZ2V0SW5zdGFuY2UoKS5sb2dFdmVudCgnUGxhY2UgT2JqZWN0JywgYW1wRXZlbnRQcm9wZXJ0aWVzKTtcclxuXHJcbiAgfSxcclxuXHJcblx0b25PYmplY3RDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwib25PYmplY3RDaGFuZ2UgdHJpZ2dlcmVkXCIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBJdGVtIGVsZW1lbnQgKHRoZSBwbGFjZWFibGUgY2l0eSBvYmplY3QpIHNlbGVjdGVkIG9uIHRoaXMgY29udHJvbGxlclxyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XHJcbiAgICB2YXIgdGhpc0l0ZW1FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpc0l0ZW1JRCk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG5cclxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3QgY3VycmVudGx5IHNlbGVjdGVkPyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcbiAgICB2YXIgb2JqZWN0R3JvdXAgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0Z3JvdXBWYWx1ZTtcclxuXHJcbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxyXG4gICAgdmFyIG9iamVjdEFycmF5ID0gdGhpcy5ncm91cEpTT05BcnJheVtvYmplY3RHcm91cF07XHJcblxyXG4gICAgLy8gV2hhdCBpcyB0aGUgSUQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtP1xyXG4gICAgdmFyIG5ld09iamVjdElkID0gcGFyc2VJbnQobWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuICAgIHZhciBzZWxlY3RlZE9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG5cclxuXHRcdC8vIFNldCB0aGUgcHJldmlldyBvYmplY3QgdG8gYmUgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBcInByZXZpZXdcIiBpdGVtXHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqLW1vZGVsJywgeyBvYmo6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uZmlsZSArIFwiLm9iailcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRsOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCJ9KTtcclxuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdzY2FsZScsIG9iamVjdEFycmF5W25ld09iamVjdElkXS5zY2FsZSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0SWQnLCBuZXdPYmplY3RJZCk7XHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0R3JvdXAnLCBvYmplY3RHcm91cCk7XHJcbiAgICB0aGlzSXRlbUVsLmZsdXNoVG9ET00oKTtcclxuXHR9LFxyXG5cclxuICAvKipcclxuICAgKiBVbmRvIC0gZGVsZXRlcyB0aGUgbW9zdCByZWNlbnRseSBwbGFjZWQgb2JqZWN0XHJcbiAgICovXHJcbiAgb25VbmRvOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjaXR5Q2hpbGRFbGVtZW50Q291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2l0eScpLmNoaWxkRWxlbWVudENvdW50O1xyXG4gICAgaWYgKGNpdHlDaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcclxuICBcdFx0dmFyIHByZXZpb3VzT2JqZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvYmplY3RcIiArIChjaXR5Q2hpbGRFbGVtZW50Q291bnQgLSAxKSk7XHJcbiAgXHRcdHByZXZpb3VzT2JqZWN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNPYmplY3QpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG4vKipcclxuICogTG9hZHMgYW5kIHNldHVwIGdyb3VuZCBtb2RlbC5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JvdW5kJywge1xyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvYmplY3RMb2FkZXI7XHJcbiAgICB2YXIgb2JqZWN0M0QgPSB0aGlzLmVsLm9iamVjdDNEO1xyXG4gICAgLy8gdmFyIE1PREVMX1VSTCA9ICdodHRwczovL2Nkbi5hZnJhbWUuaW8vbGluay10cmF2ZXJzYWwvbW9kZWxzL2dyb3VuZC5qc29uJztcclxuICAgIHZhciBNT0RFTF9VUkwgPSAnYXNzZXRzL2Vudmlyb25tZW50L2dyb3VuZC5qc29uJztcclxuICAgIGlmICh0aGlzLm9iamVjdExvYWRlcikgeyByZXR1cm47IH1cclxuICAgIG9iamVjdExvYWRlciA9IHRoaXMub2JqZWN0TG9hZGVyID0gbmV3IFRIUkVFLk9iamVjdExvYWRlcigpO1xyXG4gICAgb2JqZWN0TG9hZGVyLmNyb3NzT3JpZ2luID0gJyc7XHJcbiAgICBvYmplY3RMb2FkZXIubG9hZChNT0RFTF9VUkwsIGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgb2JqLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XHJcbiAgICAgICAgdmFsdWUubWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gICAgICB9KTtcclxuICAgICAgb2JqZWN0M0QuYWRkKG9iaik7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvZ3JvdW5kLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5BRlJBTUUucmVnaXN0ZXJTaGFkZXIoJ3NreUdyYWRpZW50Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3JUb3A6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ2JsYWNrJywgaXM6ICd1bmlmb3JtJyB9LFxyXG4gICAgY29sb3JCb3R0b206IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ3JlZCcsIGlzOiAndW5pZm9ybScgfVxyXG4gIH0sXHJcblxyXG4gIHZlcnRleFNoYWRlcjogW1xyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKSB7JyxcclxuXHJcbiAgICAgICd2ZWM0IHdvcmxkUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG4gICAgICAndldvcmxkUG9zaXRpb24gPSB3b3JsZFBvc2l0aW9uLnh5ejsnLFxyXG5cclxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG5cclxuICAgICd9J1xyXG5cclxuICBdLmpvaW4oJ1xcbicpLFxyXG5cclxuICBmcmFnbWVudFNoYWRlcjogW1xyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvclRvcDsnLFxyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvckJvdHRvbTsnLFxyXG5cclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCknLFxyXG5cclxuICAgICd7JyxcclxuICAgICAgJ3ZlYzMgcG9pbnRPblNwaGVyZSA9IG5vcm1hbGl6ZSh2V29ybGRQb3NpdGlvbi54eXopOycsXHJcbiAgICAgICdmbG9hdCBmID0gMS4wOycsXHJcbiAgICAgICdpZihwb2ludE9uU3BoZXJlLnkgPiAtIDAuMil7JyxcclxuXHJcbiAgICAgICAgJ2YgPSBzaW4ocG9pbnRPblNwaGVyZS55ICogMi4wKTsnLFxyXG5cclxuICAgICAgJ30nLFxyXG4gICAgICAnZ2xfRnJhZ0NvbG9yID0gdmVjNChtaXgoY29sb3JCb3R0b20sY29sb3JUb3AsIGYgKSwgMS4wKTsnLFxyXG5cclxuICAgICd9J1xyXG4gIF0uam9pbignXFxuJylcclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9za3lHcmFkaWVudC5qcyJdLCJzb3VyY2VSb290IjoiIn0=