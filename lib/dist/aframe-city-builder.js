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
	
	    var newId = 'object' + document.getElementById('city').childElementCount;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYTBkNzUwZDA5ZGUwNDY1MjFhMzIiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtZ3JpZGhlbHBlci1jb21wb25lbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2FuaW1lanMvYW5pbWUuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL2FjdGlvbi1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi9saWIvZ3JvdW5kLmpzIiwid2VicGFjazovLy8uL2xpYi9za3lHcmFkaWVudC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwiQUZSQU1FIiwiRXJyb3IiLCJyZWdpc3RlckNvbXBvbmVudCIsInNjaGVtYSIsIm1lbnVJRCIsInR5cGUiLCJkZWZhdWx0IiwibXVsdGlwbGUiLCJhZGRFdmVudExpc3RlbmVycyIsIm1lbnVFbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJkYXRhIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uQWN0aW9uQ2hhbmdlIiwiYmluZCIsIm9uQWN0aW9uU2VsZWN0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lcnMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5pdCIsIm9wdGlvblZhbHVlIiwiY29tcG9uZW50cyIsInNlbGVjdGVkT3B0aW9uVmFsdWUiLCJoYW5kbGVBY3Rpb25TdGFydCIsImNvbnNvbGUiLCJsb2ciLCJzYXZlQnV0dG9uIiwib3ZlcndyaXRlIiwiY2l0eUVsIiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwic2V0QXR0cmlidXRlIiwidGl0bGUiLCJxdWVyeVNlbGVjdG9yQWxsIiwib25VbmRvIiwicXVlcnlTZWxlY3RvciIsImV4aXRWUiIsImhhbmRsZUFjdGlvbkVuZCIsInByZXZpb3VzQWN0aW9uIiwicGxheSIsInBhdXNlIiwicmVtb3ZlIiwiY29udHJvbEVsIiwiZWwiLCJldnQiLCJkZXRhaWwiLCJpbnRlcnNlY3RlZEVsIiwicGFyZW50Tm9kZSIsInJlbW92ZUF0dHJpYnV0ZSIsImh1bWFuaXplIiwic3RyIiwiZnJhZ3MiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiam9pbiIsIm1lbnVJZCIsIm9uT2JqZWN0Q2hhbmdlIiwib25QbGFjZU9iamVjdCIsImxpc3QiLCJncm91cEpTT05BcnJheSIsImZvckVhY2giLCJncm91cE5hbWUiLCJpbmRleCIsInJlcXVlc3RVUkwiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2VuZCIsIm9ubG9hZCIsInJlc3BvbnNlIiwibmV3T3B0Z3JvdXBFbCIsImNyZWF0ZUVsZW1lbnQiLCJvcHRpb25zSFRNTCIsIm9iamVjdERlZmluaXRpb24iLCJpbm5lckhUTUwiLCJhcHBlbmRDaGlsZCIsInRoaXNJdGVtSUQiLCJpZCIsInRoaXNJdGVtRWwiLCJvYmplY3RJZCIsInBhcnNlSW50IiwiYXR0cmlidXRlcyIsInZhbHVlIiwib2JqZWN0R3JvdXAiLCJyb3VuZGluZyIsIm9iamVjdEFycmF5IiwidGhpc0l0ZW1Xb3JsZFBvc2l0aW9uIiwib2JqZWN0M0QiLCJnZXRXb3JsZFBvc2l0aW9uIiwidGhpc0l0ZW1Xb3JsZFJvdGF0aW9uIiwiZ2V0V29ybGRSb3RhdGlvbiIsIm9yaWdpbmFsUG9zaXRpb25TdHJpbmciLCJ4IiwieSIsInoiLCJyb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YIiwiTWF0aCIsInJvdW5kIiwicm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWSIsInJvdW5kZWRJdGVtV29ybGRQb3NpdGlvbloiLCJyb3VuZGVkUG9zaXRpb25TdHJpbmciLCJ0aGlzSXRlbVdvcmxkUm90YXRpb25YIiwiX3giLCJQSSIsInRoaXNJdGVtV29ybGRSb3RhdGlvblkiLCJfeSIsInRoaXNJdGVtV29ybGRSb3RhdGlvbloiLCJfeiIsIm9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyIsInJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZIiwicm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmciLCJuZXdJZCIsImNoaWxkRWxlbWVudENvdW50IiwiJCIsImNsYXNzIiwic2NhbGUiLCJyb3RhdGlvbiIsImZpbGUiLCJhcHBlbmRUbyIsIm5ld09iamVjdCIsInByb3BlcnR5IiwiZHVyIiwiZnJvbSIsInRvIiwiYW1wRXZlbnRQcm9wZXJ0aWVzIiwiYW1wbGl0dWRlIiwiZ2V0SW5zdGFuY2UiLCJsb2dFdmVudCIsInNlbGVjdGVkT3B0Z3JvdXBWYWx1ZSIsIm5ld09iamVjdElkIiwic2VsZWN0ZWRPcHRpb25JbmRleCIsIm9iaiIsIm10bCIsImZsdXNoVG9ET00iLCJjaXR5Q2hpbGRFbGVtZW50Q291bnQiLCJwcmV2aW91c09iamVjdCIsIm9iamVjdExvYWRlciIsIk1PREVMX1VSTCIsIlRIUkVFIiwiT2JqZWN0TG9hZGVyIiwiY3Jvc3NPcmlnaW4iLCJsb2FkIiwiY2hpbGRyZW4iLCJyZWNlaXZlU2hhZG93IiwibWF0ZXJpYWwiLCJzaGFkaW5nIiwiRmxhdFNoYWRpbmciLCJhZGQiLCJyZWdpc3RlclNoYWRlciIsImNvbG9yVG9wIiwiaXMiLCJjb2xvckJvdHRvbSIsInZlcnRleFNoYWRlciIsImZyYWdtZW50U2hhZGVyIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdENBLG9CQUFBQSxDQUFRLENBQVI7QUFDQSxvQkFBQUEsQ0FBUSxDQUFSO0FBQ0Esb0JBQUFBLENBQVEsQ0FB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QTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBaUMsa0JBQWtCLEVBQUU7QUFDckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNERBQTJELGFBQWEsRUFBRTtBQUMxRTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHNEQUFxRCw4QkFBOEIsRUFBRTtBQUNyRiw0QkFBMkIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTRDLDBCQUEwQixFQUFFO0FBQ3hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFD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YjtBQUNELE1BTkQ7QUFPRDtBQWhCZ0MsRUFBbkMsRTs7Ozs7Ozs7QUNMQTtBQUNBeEksUUFBT3lKLGNBQVAsQ0FBc0IsYUFBdEIsRUFBcUM7QUFDbkN0SixXQUFRO0FBQ051SixlQUFVLEVBQUVySixNQUFNLE9BQVIsRUFBaUJDLFNBQVMsT0FBMUIsRUFBbUNxSixJQUFJLFNBQXZDLEVBREo7QUFFTkMsa0JBQWEsRUFBRXZKLE1BQU0sT0FBUixFQUFpQkMsU0FBUyxLQUExQixFQUFpQ3FKLElBQUksU0FBckM7QUFGUCxJQUQyQjs7QUFNbkNFLGlCQUFjLENBQ1osOEJBRFksRUFHWixlQUhZLEVBS1YsMkRBTFUsRUFNVixxQ0FOVSxFQVFWLDJFQVJVLEVBVVosR0FWWSxFQVlabkcsSUFaWSxDQVlQLElBWk8sQ0FOcUI7O0FBb0JuQ29HLG1CQUFnQixDQUNkLHdCQURjLEVBRWQsMkJBRmMsRUFJZCw4QkFKYyxFQU1kLGFBTmMsRUFRZCxHQVJjLEVBU1oscURBVFksRUFVWixnQkFWWSxFQVdaLDhCQVhZLEVBYVYsaUNBYlUsRUFlWixHQWZZLEVBZ0JaLDBEQWhCWSxFQWtCZCxHQWxCYyxFQW1CZHBHLElBbkJjLENBbUJULElBbkJTO0FBcEJtQixFQUFyQyxFIiwiZmlsZSI6ImFmcmFtZS1jaXR5LWJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBhMGQ3NTBkMDlkZTA0NjUyMWEzMiIsInJlcXVpcmUoJ2FmcmFtZS1ncmlkaGVscGVyLWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCdhZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudCcpO1xyXG5yZXF1aXJlKCcuL2xpYi9hY3Rpb24tY29udHJvbHMuanMnKTtcclxucmVxdWlyZSgnLi9saWIvYnVpbGRlci1jb250cm9scy5qcycpO1xyXG5yZXF1aXJlKCcuL2xpYi9ncm91bmQuanMnKTtcclxucmVxdWlyZSgnLi9saWIvc2t5R3JhZGllbnQuanMnKTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vaW5kZXguanMiLCJpZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcbn1cblxuLyoqXG4gKiBHcmlkSGVscGVyIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cbiAqL1xuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdncmlkaGVscGVyJywge1xuICBzY2hlbWE6IHtcbiAgICBzaXplOiB7IGRlZmF1bHQ6IDUgfSxcbiAgICBkaXZpc2lvbnM6IHsgZGVmYXVsdDogMTAgfSxcbiAgICBjb2xvckNlbnRlckxpbmU6IHtkZWZhdWx0OiAncmVkJ30sXG4gICAgY29sb3JHcmlkOiB7ZGVmYXVsdDogJ2JsYWNrJ31cbiAgfSxcblxuICAvKipcbiAgICogQ2FsbGVkIG9uY2Ugd2hlbiBjb21wb25lbnQgaXMgYXR0YWNoZWQuIEdlbmVyYWxseSBmb3IgaW5pdGlhbCBzZXR1cC5cbiAgICovXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2NlbmUgPSB0aGlzLmVsLm9iamVjdDNEO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuXG4gICAgdmFyIHNpemUgPSBkYXRhLnNpemU7XG4gICAgdmFyIGRpdmlzaW9ucyA9IGRhdGEuZGl2aXNpb25zO1xuICAgIHZhciBjb2xvckNlbnRlckxpbmUgPSBkYXRhLmNvbG9yQ2VudGVyTGluZTtcbiAgICB2YXIgY29sb3JHcmlkID0gZGF0YS5jb2xvckdyaWQ7XG5cbiAgICB2YXIgZ3JpZEhlbHBlciA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKCBzaXplLCBkaXZpc2lvbnMsIGNvbG9yQ2VudGVyTGluZSwgY29sb3JHcmlkICk7XG4gICAgZ3JpZEhlbHBlci5uYW1lID0gXCJncmlkSGVscGVyXCI7XG4gICAgc2NlbmUuYWRkKGdyaWRIZWxwZXIpO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2NlbmUgPSB0aGlzLmVsLm9iamVjdDNEO1xuICAgIHNjZW5lLnJlbW92ZShzY2VuZS5nZXRPYmplY3RCeU5hbWUoXCJncmlkSGVscGVyXCIpKTtcbiAgfVxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYWZyYW1lLWdyaWRoZWxwZXItY29tcG9uZW50L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cblxudmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpO1xuXG5pZiAodHlwZW9mIEFGUkFNRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgYXR0ZW1wdGVkIHRvIHJlZ2lzdGVyIGJlZm9yZSBBRlJBTUUgd2FzIGF2YWlsYWJsZS4nKTtcbn1cblxudmFyIHV0aWxzID0gQUZSQU1FLnV0aWxzO1xudmFyIGdldENvbXBvbmVudFByb3BlcnR5ID0gdXRpbHMuZW50aXR5LmdldENvbXBvbmVudFByb3BlcnR5O1xudmFyIHNldENvbXBvbmVudFByb3BlcnR5ID0gdXRpbHMuZW50aXR5LnNldENvbXBvbmVudFByb3BlcnR5O1xudmFyIHN0eWxlUGFyc2VyID0gdXRpbHMuc3R5bGVQYXJzZXIucGFyc2U7XG5cbi8qKlxuICogQW5pbWF0aW9uIGNvbXBvbmVudCBmb3IgQS1GcmFtZS5cbiAqXG4gKiBAbWVtYmVyIHtib29sZWFufSBhbmltYXRpb25Jc1BsYXlpbmcgLSBVc2VkIGR1cmluZyBpbml0aWFsaXphdGlvbiBhbmQgc2NlbmUgcmVzdW1lIHRvIHNlZVxuICogIGlmIGFuaW1hdGlvbiBzaG91bGQgYmUgcGxheWluZy5cbiAqL1xuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhbmltYXRpb24nLCB7XG4gIHNjaGVtYToge1xuICAgIGRlbGF5OiB7ZGVmYXVsdDogMH0sXG4gICAgZGlyOiB7ZGVmYXVsdDogJyd9LFxuICAgIGR1cjoge2RlZmF1bHQ6IDEwMDB9LFxuICAgIGVhc2luZzoge2RlZmF1bHQ6ICdlYXNlSW5RdWFkJ30sXG4gICAgZWxhc3RpY2l0eToge2RlZmF1bHQ6IDQwMH0sXG4gICAgZnJvbToge2RlZmF1bHQ6ICcnfSxcbiAgICBsb29wOiB7ZGVmYXVsdDogZmFsc2V9LFxuICAgIHByb3BlcnR5OiB7ZGVmYXVsdDogJyd9LFxuICAgIHJlcGVhdDoge2RlZmF1bHQ6IDB9LFxuICAgIHN0YXJ0RXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgcGF1c2VFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICByZXN1bWVFdmVudHM6IHt0eXBlOiAnYXJyYXknfSxcbiAgICByZXN0YXJ0RXZlbnRzOiB7dHlwZTogJ2FycmF5J30sXG4gICAgdG86IHtkZWZhdWx0OiAnJ31cbiAgfSxcblxuICBtdWx0aXBsZTogdHJ1ZSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24gPSBudWxsO1xuICAgIHRoaXMuYW5pbWF0aW9uSXNQbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5jb25maWcgPSBudWxsO1xuICAgIHRoaXMucGxheUFuaW1hdGlvbkJvdW5kID0gdGhpcy5wbGF5QW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbkJvdW5kID0gdGhpcy5wYXVzZUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVzdW1lQW5pbWF0aW9uQm91bmQgPSB0aGlzLnJlc3VtZUFuaW1hdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVzdGFydEFuaW1hdGlvbkJvdW5kID0gdGhpcy5yZXN0YXJ0QW5pbWF0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXBlYXQgPSAwO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBhdHRyTmFtZSA9IHRoaXMuYXR0ck5hbWU7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wZXJ0eVR5cGUoZWwsIGRhdGEucHJvcGVydHkpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghZGF0YS5wcm9wZXJ0eSkgeyByZXR1cm47IH1cblxuICAgIC8vIEJhc2UgY29uZmlnLlxuICAgIHRoaXMucmVwZWF0ID0gZGF0YS5yZXBlYXQ7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgIGJlZ2luOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsLmVtaXQoJ2FuaW1hdGlvbmJlZ2luJyk7XG4gICAgICAgIGVsLmVtaXQoYXR0ck5hbWUgKyAnLWJlZ2luJyk7XG4gICAgICB9LFxuICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuZW1pdCgnYW5pbWF0aW9uY29tcGxldGUnKTtcbiAgICAgICAgZWwuZW1pdChhdHRyTmFtZSArICctY29tcGxldGUnKTtcbiAgICAgICAgLy8gUmVwZWF0LlxuICAgICAgICBpZiAoLS1zZWxmLnJlcGVhdCA+IDApIHsgc2VsZi5hbmltYXRpb24ucGxheSgpOyB9XG4gICAgICB9LFxuICAgICAgZGlyZWN0aW9uOiBkYXRhLmRpcixcbiAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cixcbiAgICAgIGVhc2luZzogZGF0YS5lYXNpbmcsXG4gICAgICBlbGFzdGljaXR5OiBkYXRhLmVsYXN0aWNpdHksXG4gICAgICBsb29wOiBkYXRhLmxvb3BcbiAgICB9O1xuXG4gICAgLy8gQ3VzdG9taXplIGNvbmZpZyBiYXNlZCBvbiBwcm9wZXJ0eSB0eXBlLlxuICAgIHZhciB1cGRhdGVDb25maWcgPSBjb25maWdEZWZhdWx0O1xuICAgIGlmIChwcm9wVHlwZSA9PT0gJ3ZlYzInIHx8IHByb3BUeXBlID09PSAndmVjMycgfHwgcHJvcFR5cGUgPT09ICd2ZWM0Jykge1xuICAgICAgdXBkYXRlQ29uZmlnID0gY29uZmlnVmVjdG9yO1xuICAgIH1cblxuICAgIC8vIENvbmZpZy5cbiAgICB0aGlzLmNvbmZpZyA9IHVwZGF0ZUNvbmZpZyhlbCwgZGF0YSwgY29uZmlnKTtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGFuaW1lKHRoaXMuY29uZmlnKTtcblxuICAgIC8vIFN0b3AgcHJldmlvdXMgYW5pbWF0aW9uLlxuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcblxuICAgIGlmICghdGhpcy5kYXRhLnN0YXJ0RXZlbnRzLmxlbmd0aCkgeyB0aGlzLmFuaW1hdGlvbklzUGxheWluZyA9IHRydWU7IH1cblxuICAgIC8vIFBsYXkgYW5pbWF0aW9uIGlmIG5vIGhvbGRpbmcgZXZlbnQuXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogYHJlbW92ZWAgaGFuZGxlci5cbiAgICovXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucGF1c2VBbmltYXRpb24oKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGBwYXVzZWAgaGFuZGxlci5cbiAgICovXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wYXVzZUFuaW1hdGlvbigpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfSxcblxuICAvKipcbiAgICogYHBsYXlgIGhhbmRsZXIuXG4gICAqL1xuICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCF0aGlzLmFuaW1hdGlvbiB8fCAhdGhpcy5hbmltYXRpb25Jc1BsYXlpbmcpIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBEZWxheS5cbiAgICBpZiAoZGF0YS5kZWxheSkge1xuICAgICAgc2V0VGltZW91dChwbGF5LCBkYXRhLmRlbGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXkgKCkge1xuICAgICAgc2VsZi5wbGF5QW5pbWF0aW9uKCk7XG4gICAgICBzZWxmLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgZGF0YS5zdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGxheUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnBhdXNlRXZlbnRzLm1hcChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgc2VsZi5wYXVzZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3VtZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdW1lQW5pbWF0aW9uQm91bmQpO1xuICAgIH0pO1xuICAgIGRhdGEucmVzdGFydEV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucmVzdGFydEFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGRhdGEuc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnBsYXlBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5wYXVzZUV2ZW50cy5tYXAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHNlbGYucGF1c2VBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gICAgZGF0YS5yZXN1bWVFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3VtZUFuaW1hdGlvbkJvdW5kKTtcbiAgICB9KTtcbiAgICBkYXRhLnJlc3RhcnRFdmVudHMubWFwKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBzZWxmLnJlc3RhcnRBbmltYXRpb25Cb3VuZCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcGxheUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWUodGhpcy5jb25maWcpO1xuICAgIHRoaXMuYW5pbWF0aW9uLnBsYXkoKTtcbiAgfSxcblxuICBwYXVzZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uLnBhdXNlKCk7XG4gIH0sXG5cbiAgcmVzdW1lQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hbmltYXRpb24ucGxheSgpO1xuICB9LFxuXG4gIHJlc3RhcnRBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbi5yZXN0YXJ0KCk7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFN0dWZmIHByb3BlcnR5IGludG8gZ2VuZXJpYyBgcHJvcGVydHlgIGtleS5cbiAqL1xuZnVuY3Rpb24gY29uZmlnRGVmYXVsdCAoZWwsIGRhdGEsIGNvbmZpZykge1xuICB2YXIgZnJvbSA9IGRhdGEuZnJvbSB8fCBnZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbe2FmcmFtZVByb3BlcnR5OiBmcm9tfV0sXG4gICAgYWZyYW1lUHJvcGVydHk6IGRhdGEudG8sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdLmFmcmFtZVByb3BlcnR5KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4dGVuZCB4L3kvei93IG9udG8gdGhlIGNvbmZpZy5cbiAqL1xuZnVuY3Rpb24gY29uZmlnVmVjdG9yIChlbCwgZGF0YSwgY29uZmlnKSB7XG4gIHZhciBmcm9tID0gZ2V0Q29tcG9uZW50UHJvcGVydHkoZWwsIGRhdGEucHJvcGVydHkpO1xuICBpZiAoZGF0YS5mcm9tKSB7IGZyb20gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS5mcm9tKTsgfVxuICB2YXIgdG8gPSBBRlJBTUUudXRpbHMuY29vcmRpbmF0ZXMucGFyc2UoZGF0YS50byk7XG4gIHJldHVybiBBRlJBTUUudXRpbHMuZXh0ZW5kKHt9LCBjb25maWcsIHtcbiAgICB0YXJnZXRzOiBbZnJvbV0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRDb21wb25lbnRQcm9wZXJ0eShlbCwgZGF0YS5wcm9wZXJ0eSwgdGhpcy50YXJnZXRzWzBdKTtcbiAgICB9XG4gIH0sIHRvKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydHlUeXBlIChlbCwgcHJvcGVydHkpIHtcbiAgdmFyIHNwbGl0ID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgdmFyIGNvbXBvbmVudE5hbWUgPSBzcGxpdFswXTtcbiAgdmFyIHByb3BlcnR5TmFtZSA9IHNwbGl0WzFdO1xuICB2YXIgY29tcG9uZW50ID0gZWwuY29tcG9uZW50c1tjb21wb25lbnROYW1lXSB8fCBBRlJBTUUuY29tcG9uZW50c1tjb21wb25lbnROYW1lXTtcblxuICAvLyBQcmltaXRpdmVzLlxuICBpZiAoIWNvbXBvbmVudCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjaGVtYVtwcm9wZXJ0eU5hbWVdLnR5cGU7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudC5zY2hlbWEudHlwZTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9hZnJhbWUtYW5pbWF0aW9uLWNvbXBvbmVudC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKlxuICogQW5pbWUgdjEuMS4zXG4gKiBodHRwOi8vYW5pbWUtanMuY29tXG4gKiBKYXZhU2NyaXB0IGFuaW1hdGlvbiBlbmdpbmVcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKdWxpYW4gR2FybmllclxuICogaHR0cDovL2p1bGlhbmdhcm5pZXIuY29tXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjMnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgKiB0IC0gTWF0aC5QSSAvIDIpOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLnRvdGFsRHVyYXRpb247IH0pKTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEZWxheSA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0d2VlbnMubWFwKGZ1bmN0aW9uKHR3ZWVuKXsgcmV0dXJuIHR3ZWVuLmRlbGF5OyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBbmltYXRpb25cblxuICB2YXIgY3JlYXRlQW5pbWF0aW9uID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIGFuaW0gPSB7fTtcbiAgICBhbmltLmFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICAgIGFuaW0uc2V0dGluZ3MgPSBtZXJnZU9iamVjdHMocGFyYW1zLCBkZWZhdWx0U2V0dGluZ3MpO1xuICAgIGFuaW0ucHJvcGVydGllcyA9IGdldFByb3BlcnRpZXMocGFyYW1zLCBhbmltLnNldHRpbmdzKTtcbiAgICBhbmltLnR3ZWVucyA9IGdldFR3ZWVucyhhbmltLmFuaW1hdGFibGVzLCBhbmltLnByb3BlcnRpZXMpO1xuICAgIGFuaW0uZHVyYXRpb24gPSBhbmltLnR3ZWVucy5sZW5ndGggPyBnZXRUd2VlbnNEdXJhdGlvbihhbmltLnR3ZWVucykgOiBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5kZWxheSA9IGFuaW0udHdlZW5zLmxlbmd0aCA/IGdldFR3ZWVuc0RlbGF5KGFuaW0udHdlZW5zKSA6IHBhcmFtcy5kZWxheTtcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gMDtcbiAgICBhbmltLnByb2dyZXNzID0gMDtcbiAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW07XG4gIH1cblxuICAvLyBQdWJsaWNcblxuICB2YXIgYW5pbWF0aW9ucyA9IFtdO1xuICB2YXIgcmFmID0gMDtcblxuICB2YXIgZW5naW5lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwbGF5ID0gZnVuY3Rpb24oKSB7IHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTsgfTtcbiAgICB2YXIgc3RlcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIGFuaW1hdGlvbnNbaV0udGljayh0KTtcbiAgICAgICAgcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICAgICAgcmFmID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYXk7XG4gIH0pKCk7XG5cbiAgdmFyIGFuaW1hdGlvbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuXG4gICAgdmFyIGFuaW0gPSBjcmVhdGVBbmltYXRpb24ocGFyYW1zKTtcbiAgICB2YXIgdGltZSA9IHt9O1xuXG4gICAgYW5pbS50aWNrID0gZnVuY3Rpb24obm93KSB7XG4gICAgICBhbmltLmVuZGVkID0gZmFsc2U7XG4gICAgICBpZiAoIXRpbWUuc3RhcnQpIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICB0aW1lLmN1cnJlbnQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lLmxhc3QgKyBub3cgLSB0aW1lLnN0YXJ0LCAwKSwgYW5pbS5kdXJhdGlvbik7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCB0aW1lLmN1cnJlbnQpO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmRlbGF5KSB7XG4gICAgICAgIGlmIChzLmJlZ2luKSBzLmJlZ2luKGFuaW0pOyBzLmJlZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocy51cGRhdGUpIHMudXBkYXRlKGFuaW0pO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWUuY3VycmVudCA+PSBhbmltLmR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChzLmxvb3ApIHtcbiAgICAgICAgICB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScpIHJldmVyc2VUd2VlbnMoYW5pbSwgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGlzLm51bShzLmxvb3ApKSBzLmxvb3AtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltLmVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBhbmltLnBhdXNlKCk7XG4gICAgICAgICAgaWYgKHMuY29tcGxldGUpIHMuY29tcGxldGUoYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgdGltZS5sYXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbmltLnNlZWsgPSBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgKHByb2dyZXNzIC8gMTAwKSAqIGFuaW0uZHVyYXRpb24pO1xuICAgIH1cblxuICAgIGFuaW0ucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICB2YXIgaSA9IGFuaW1hdGlvbnMuaW5kZXhPZihhbmltKTtcbiAgICAgIGlmIChpID4gLTEpIGFuaW1hdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgIH1cblxuICAgIGFuaW0ucGxheSA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgYW5pbS5wYXVzZSgpO1xuICAgICAgaWYgKHBhcmFtcykgYW5pbSA9IG1lcmdlT2JqZWN0cyhjcmVhdGVBbmltYXRpb24obWVyZ2VPYmplY3RzKHBhcmFtcywgYW5pbS5zZXR0aW5ncykpLCBhbmltKTtcbiAgICAgIHRpbWUuc3RhcnQgPSAwO1xuICAgICAgdGltZS5sYXN0ID0gYW5pbS5lbmRlZCA/IDAgOiBhbmltLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHMgPSBhbmltLnNldHRpbmdzO1xuICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAncmV2ZXJzZScpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdhbHRlcm5hdGUnICYmICFzLmxvb3ApIHMubG9vcCA9IDE7XG4gICAgICBzZXRXaWxsQ2hhbmdlKGFuaW0pO1xuICAgICAgYW5pbWF0aW9ucy5wdXNoKGFuaW0pO1xuICAgICAgaWYgKCFyYWYpIGVuZ2luZSgpO1xuICAgIH1cblxuICAgIGFuaW0ucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFuaW0ucmV2ZXJzZWQpIHJldmVyc2VUd2VlbnMoYW5pbSk7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBhbmltLnNlZWsoMCk7XG4gICAgICBhbmltLnBsYXkoKTtcbiAgICB9XG5cbiAgICBpZiAoYW5pbS5zZXR0aW5ncy5hdXRvcGxheSkgYW5pbS5wbGF5KCk7XG5cbiAgICByZXR1cm4gYW5pbTtcblxuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtdWx0aXBsZSB0YXJnZXRzIGZyb20gYWxsIGFjdGl2ZSBhbmltYXRpb25zLlxuXG4gIHZhciByZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHZhciB0YXJnZXRzID0gZmxhdHRlbkFycmF5KGlzLmFycihlbGVtZW50cykgPyBlbGVtZW50cy5tYXAodG9BcnJheSkgOiB0b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgZm9yICh2YXIgaSA9IGFuaW1hdGlvbnMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltYXRpb24udHdlZW5zO1xuICAgICAgZm9yICh2YXIgdCA9IHR3ZWVucy5sZW5ndGgtMTsgdCA+PSAwOyB0LS0pIHtcbiAgICAgICAgdmFyIGFuaW1hdGFibGVzID0gdHdlZW5zW3RdLmFuaW1hdGFibGVzO1xuICAgICAgICBmb3IgKHZhciBhID0gYW5pbWF0YWJsZXMubGVuZ3RoLTE7IGEgPj0gMDsgYS0tKSB7XG4gICAgICAgICAgaWYgKGFycmF5Q29udGFpbnModGFyZ2V0cywgYW5pbWF0YWJsZXNbYV0udGFyZ2V0KSkge1xuICAgICAgICAgICAgYW5pbWF0YWJsZXMuc3BsaWNlKGEsIDEpO1xuICAgICAgICAgICAgaWYgKCFhbmltYXRhYmxlcy5sZW5ndGgpIHR3ZWVucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBpZiAoIXR3ZWVucy5sZW5ndGgpIGFuaW1hdGlvbi5wYXVzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGlvbi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgYW5pbWF0aW9uLnNwZWVkID0gMTtcbiAgYW5pbWF0aW9uLmxpc3QgPSBhbmltYXRpb25zO1xuICBhbmltYXRpb24ucmVtb3ZlID0gcmVtb3ZlO1xuICBhbmltYXRpb24uZWFzaW5ncyA9IGVhc2luZ3M7XG4gIGFuaW1hdGlvbi5nZXRWYWx1ZSA9IGdldEluaXRpYWxUYXJnZXRWYWx1ZTtcbiAgYW5pbWF0aW9uLnBhdGggPSBnZXRQYXRoUHJvcHM7XG4gIGFuaW1hdGlvbi5yYW5kb20gPSByYW5kb207XG5cbiAgcmV0dXJuIGFuaW1hdGlvbjtcblxufSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2FuaW1lanMvYW5pbWUuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHYW1lIGxvZ2ljIGZvciBjb250cm9sbGluZyBhLWZyYW1lIGFjdGlvbnMgc3VjaCBhcyB0ZWxlcG9ydCBhbmQgc2F2ZVxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhY3Rpb24tY29udHJvbHMnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBtZW51SUQ6IHt0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0OiBcIm1lbnVcIn1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgaWYgY29tcG9uZW50IG5lZWRzIG11bHRpcGxlIGluc3RhbmNpbmcuXHJcbiAgICovXHJcbiAgbXVsdGlwbGU6IGZhbHNlLFxyXG5cclxuICAvKipcclxuICAgKiBBZGQgZXZlbnQgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBnZXQgbWVudSBlbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGVzZSBjb250cm9sc1xyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SUQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbkFjdGlvbkNoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uQWN0aW9uU2VsZWN0LmJpbmQodGhpcykpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51Q2hhbmdlZCcsIHRoaXMub25BY3Rpb25DaGFuZ2UpO1xyXG4gICAgLy8gbWVudUVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lbnVTZWxlY3RlZCcsIHRoaXMub25QbGFjZU9iamVjdCk7XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coXCJhY3Rpb24tY29udHJvbHM6IG1lbnUgZWxlbWVudDogXCIgKyBtZW51RWwpO1xyXG4gICAgLy8gZ2V0IGN1cnJlbnRseSBzZWxlY3RlZCBhY3Rpb25cclxuICAgIHZhciBvcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwib3B0aW9uVmFsdWVcIiArIG9wdGlvblZhbHVlKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvblZhbHVlKTtcclxuXHJcbiAgICAvLyBkbyB0aGUgdGhpbmcgYXNzb2NpYXRlZCB3aXRoIHRoZSBhY3Rpb25cclxuICAgIHRoaXMuaGFuZGxlQWN0aW9uU3RhcnQob3B0aW9uVmFsdWUpO1xyXG4gIH0sXHJcblxyXG4gIG9uQWN0aW9uU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyB3aGF0IGlzIHRoZSBhY3Rpb25cclxuICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmRhdGEubWVudUlEKTtcclxuXHJcblxyXG4gICAgLy8gZ2V0IGN1cnJlbnRseSBzZWxlY3RlZCBhY3Rpb25cclxuICAgIHZhciBvcHRpb25WYWx1ZSA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwib25BY3Rpb25TZWxlY3QgdHJpZ2dlcmVkOyBjdXJyZW50IG9wdGlvblZhbHVlOlxcblwiKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvblZhbHVlKTtcclxuICAgIC8vIGNhbGwgdGhlIHRoaW5nIHRoYXQgZG9lcyBpdFxyXG5cclxuICAgIHN3aXRjaCAob3B0aW9uVmFsdWUpIHtcclxuICAgICAgY2FzZSBcInNhdmVcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmUgcmVxdWVzdGVkXCIpO1xyXG4gICAgICAgIHNhdmVCdXR0b24oe292ZXJ3cml0ZTogdHJ1ZX0pO1xyXG4gICAgICAgIHJldHVybjsgLy8gd2l0aG91dCB0aGlzIHJldHVybiB0aGUgb3RoZXIgY2FzZXMgYXJlIGZpcmVkIC0gd2VpcmQhXHJcbiAgICAgIGNhc2UgXCJzYXZlQXNcIjpcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmVBcyByZXF1ZXN0ZWRcIik7XHJcbiAgICAgICAgc2F2ZUJ1dHRvbigpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgY2FzZSBcIm5ld1wiOlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwibmV3IHJlcXVlc3RlZFwiKTtcclxuICAgICAgICB2YXIgY2l0eUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaXR5XCIpO1xyXG4gICAgICAgIHdoaWxlIChjaXR5RWwuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgY2l0eUVsLnJlbW92ZUNoaWxkKGNpdHlFbC5maXJzdENoaWxkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS5zZXRBdHRyaWJ1dGUoXCJ0ZXh0X19jaXR5bmFtZVwiLCBcInZhbHVlXCIsIFwiI05ld0NpdHlcIilcclxuICAgICAgICBkb2N1bWVudC50aXRsZSA9IFwiYWZyYW1lLmNpdHlcIjtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJ1bmRvXCI6XHJcbiAgICAgICAgLy8gZmluZCBlbGVtZW50IHdpdGggXCJidWlsZGVyLWNvbnRyb2xzXCIgYXR0cmlidXRlXHJcbiAgICAgICAgLy8gZmlyZSB0aGUgb25VbmRvIGV2ZW50XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS1lbnRpdHlbYnVpbGRlci1jb250cm9sc10nKVswXS5jb21wb25lbnRzWydidWlsZGVyLWNvbnRyb2xzJ10ub25VbmRvKCk7XHJcbi8vICAgICAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcbi8vICAgICAgICB2YXIgdW5kb1Jlc3VsdCA9IG1lbnVFbC5jb21wb25lbnRzWydzZWxlY3QtYmFyJ10uc2VsZWN0ZWRPcHRpb25WYWx1ZTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJleGl0XCI6XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYS1zY2VuZScpLmV4aXRWUigpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBvbkFjdGlvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gdW5kbyBvbGQgb25lXHJcbiAgICB0aGlzLmhhbmRsZUFjdGlvbkVuZCh0aGlzLnByZXZpb3VzQWN0aW9uKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJRCk7XHJcbiAgICAvLyBnZXQgY3VycmVudGx5IHNlbGVjdGVkIGFjdGlvblxyXG4gICAgdmFyIG9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJuZXcgb3B0aW9uVmFsdWU6IFwiICsgb3B0aW9uVmFsdWUpO1xyXG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9uVmFsdWUpO1xyXG4gICAgLy8gZG8gbmV3IG9uZVxyXG4gICAgdGhpcy5oYW5kbGVBY3Rpb25TdGFydChvcHRpb25WYWx1ZSk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gZW50aXR5IHJlc3VtZXMuXHJcbiAgICogVXNlIHRvIGNvbnRpbnVlIG9yIGFkZCBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcGF1c2VzLlxyXG4gICAqIFVzZSB0byBzdG9wIG9yIHJlbW92ZSBhbnkgZHluYW1pYyBvciBiYWNrZ3JvdW5kIGJlaGF2aW9yIHN1Y2ggYXMgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHBhdXNlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gYSBjb21wb25lbnQgaXMgcmVtb3ZlZCAoZS5nLiwgdmlhIHJlbW92ZUF0dHJpYnV0ZSkuXHJcbiAgICogR2VuZXJhbGx5IHVuZG9lcyBhbGwgbW9kaWZpY2F0aW9ucyB0byB0aGUgZW50aXR5LlxyXG4gICAqL1xyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIGhhbmRsZUFjdGlvblN0YXJ0OiBmdW5jdGlvbihvcHRpb25WYWx1ZSkge1xyXG4gICAgdGhpcy5wcmV2aW91c0FjdGlvbiA9IG9wdGlvblZhbHVlO1xyXG4gICAgdmFyIGNvbnRyb2xFbCA9IHRoaXMuZWw7XHJcblxyXG4gICAgLy8gZm9yIGdpdmVuIG9wdGlvblZhbHVlLCBkbyBzb21ldGhpbmdcclxuICAgIHN3aXRjaCAob3B0aW9uVmFsdWUpIHtcclxuXHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOiAgICAgICAgLy8gYWRkIHRlbGVwb3J0IGNvbXBvbmVudCB0byB0aGUgY29udHJvbCBlbGVtZW50IHRoYXQgaXMgdGhlIHBhcmVudCBvZiB0aGlzIG1lbnVcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRlbGVwb3J0U3RhcnRcIik7XHJcblxyXG4gICAgICAgIC8vIEFkZCBhdHRyaWJ1dGUgZnJvbSB0aGlzIGh0bWw6IHRlbGVwb3J0LWNvbnRyb2xzPVwiYnV0dG9uOiB0cmlnZ2VyOyBjb2xsaXNpb25FbnRpdGllczogI2dyb3VuZFwiXHJcbiAgICAgICAgY29udHJvbEVsLnNldEF0dHJpYnV0ZShcInRlbGVwb3J0LWNvbnRyb2xzXCIsIFwiYnV0dG9uOiB0cmlnZ2VyOyBjb2xsaXNpb25FbnRpdGllczogI2dyb3VuZFwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJlcmFzZVwiOlxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZXJhc2VTdGFydFwiKTtcclxuICAgICAgICAvLyBhZGQgYXR0cmlidXRlIGZvciByYXljYXN0ZXIgY3Vyc29yIGZvciBzZWxlY3Rpbmcgb2JqZWN0IHRvIGRlbGV0ZSBodHRwczovL2dpdGh1Yi5jb20vYnJ5aWsvYWZyYW1lLWNvbnRyb2xsZXItY3Vyc29yLWNvbXBvbmVudFxyXG4gICAgICAgIGNvbnRyb2xFbC5zZXRBdHRyaWJ1dGUoXCJjb250cm9sbGVyLWN1cnNvclwiLCBcImNvbG9yOiByZWRcIik7XHJcbiAgICAgICAgY29udHJvbEVsLnNldEF0dHJpYnV0ZShcInJheWNhc3RlclwiLCBcIm9iamVjdHM6IC5vYmplY3RcIik7XHJcblxyXG4gICAgICAgIC8vIGNyZWF0ZSBsaXN0ZW5lciBmb3IgbW91c2UgZG93biBldmVudCBvbiB0aGlzIGVsZW1lbnQ6XHJcbiAgICAgICAgY29udHJvbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ0kgd2FzIGNsaWNrZWQgYXQ6ICcsIGV2dC5kZXRhaWwuaW50ZXJzZWN0aW9uLnBvaW50KTtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGV2dC5kZXRhaWwpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJlcmFzZSByZXF1ZXN0ZWQgKGNsaWNrIGV2ZW50IGZpcmVkIG9uIGNvbnRyb2xFbClcIik7XHJcbi8vICAgICAgICAgIGNvbnNvbGUubG9nKGV2dC5kZXRhaWwuaW50ZXJzZWN0ZWRFbCk7XHJcbiAgICAgICAgICAvLyBldnQuZGV0YWlsLmludGVyc2VjdGVkRWwuc2V0QXR0cmlidXRlKFwidmlzaWJsZVwiLCBcImZhbHNlXCIpO1xyXG4gICAgICAgICAgZXZ0LmRldGFpbC5pbnRlcnNlY3RlZEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZXZ0LmRldGFpbC5pbnRlcnNlY3RlZEVsKTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdJIHdhcyBjbGlja2VkIGF0OiAnLCBldnQuZGV0YWlsLmludGVyc2VjdGlvbi5wb2ludCk7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhldnQuZGV0YWlsKTtcclxuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGZpcmluZ1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJNT1VTRUVOVEVSIGV2ZW50IGZpcmVkIG9uIGNvbnRyb2xFbFwiKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGV2dC5kZXRhaWwuaW50ZXJzZWN0ZWRFbCk7XHJcbiAgICAgICAgICBldnQuZGV0YWlsLmludGVyc2VjdGVkRWwuc2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIiwgXCJjb2xvclwiLCBcInJlZFwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBtb25pdG9yIGZvciBldmVudCB3aGVuIHRoZSBjb250cm9sRWwgY3Vyc29yIGVtaXRzOlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBoYW5kbGVBY3Rpb25FbmQ6IGZ1bmN0aW9uKG9wdGlvblZhbHVlKSB7XHJcbiAgICB2YXIgY29udHJvbEVsID0gdGhpcy5lbDtcclxuXHJcbiAgICAvLyBmb3IgZ2l2ZW4gb3B0aW9uVmFsdWUsIGRvIHNvbWV0aGluZ1xyXG4gICAgc3dpdGNoIChvcHRpb25WYWx1ZSkge1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjogICAgICAgIC8vIHJlbW92ZSB0ZWxlcG9ydCBjb21wb25lbnRcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRlbGVwb3J0RW5kXCIpO1xyXG4gICAgICAgIGNvbnRyb2xFbC5yZW1vdmVBdHRyaWJ1dGUoXCJ0ZWxlcG9ydC1jb250cm9sc1wiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGNhc2UgXCJlcmFzZVwiOlxyXG4gICAgICAgIGNvbnRyb2xFbC5yZW1vdmVBdHRyaWJ1dGUoXCJyYXljYXN0ZXJcIik7XHJcbiAgICAgICAgY29udHJvbEVsLnJlbW92ZUF0dHJpYnV0ZShcImNvbnRyb2xsZXItY3Vyc29yXCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZXJhc2VFbmRcIik7XHJcbiAgICAgICAgY29udHJvbEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge30gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2FjdGlvbi1jb250cm9scy5qcyIsIi8qIGdsb2JhbCBBRlJBTUUgKi9cclxuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGh1bWFuaXplKHN0cikge1xyXG4gIHZhciBmcmFncyA9IHN0ci5zcGxpdCgnXycpO1xyXG4gIHZhciBpPTA7XHJcbiAgZm9yIChpPTA7IGk8ZnJhZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGZyYWdzW2ldID0gZnJhZ3NbaV0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBmcmFnc1tpXS5zbGljZSgxKTtcclxuICB9XHJcbiAgcmV0dXJuIGZyYWdzLmpvaW4oJyAnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZpdmUgQ29udHJvbGxlciBUZW1wbGF0ZSBjb21wb25lbnQgZm9yIEEtRnJhbWUuXHJcbiAqIE1vZGlmZWQgZnJvbSBBLUZyYW1lIERvbWlub2VzLlxyXG4gKi9cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdidWlsZGVyLWNvbnRyb2xzJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgbWVudUlkOiB7dHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdDogXCJtZW51XCJ9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IGlmIGNvbXBvbmVudCBuZWVkcyBtdWx0aXBsZSBpbnN0YW5jaW5nLlxyXG4gICAqL1xyXG4gIG11bHRpcGxlOiBmYWxzZSxcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGV2ZW50IGxpc3RlbmVycy5cclxuICAgKi9cclxuICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGVsID0gdGhpcy5lbDtcclxuICAgIC8vIHRoaXMgaXMgdGhlIG9ubHkgY29udHJvbGxlciBmdW50aW9uIG5vdCBjb3ZlcmVkIGJ5IHNlbGVjdCBtZW51IGNvbXBvbmVudFxyXG4gICAgLy8gQXBwbGljYWJsZSB0byBib3RoIFZpdmUgYW5kIE9jdWx1cyBUb3VjaCBjb250cm9sc1xyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZ3JpcGRvd24nLCB0aGlzLm9uVW5kby5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyB0aGUgcmVzdCBvZiB0aGUgY29udHJvbHMgYXJlIGhhbmRsZWQgYnkgdGhlIG1lbnUgZWxlbWVudFxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG4gICAgbWVudUVsLmFkZEV2ZW50TGlzdGVuZXIoJ21lbnVDaGFuZ2VkJywgdGhpcy5vbk9iamVjdENoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgIG1lbnVFbC5hZGRFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QuYmluZCh0aGlzKSk7XHJcblxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXHJcbiAgICovXHJcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlbCA9IHRoaXMuZWw7XHJcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdncmlwZG93bicsIHRoaXMub25VbmRvKTtcclxuXHJcbiAgICB2YXIgbWVudUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5kYXRhLm1lbnVJZCk7XHJcbiAgICBtZW51RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVudUNoYW5nZWQnLCB0aGlzLm9uT2JqZWN0Q2hhbmdlKTtcclxuICAgIG1lbnVFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZW51U2VsZWN0ZWQnLCB0aGlzLm9uUGxhY2VPYmplY3QpO1xyXG5cclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIGdldCB0aGUgbGlzdCBvZiBvYmplY3QgZ3JvdXAganNvbiBkaXJlY3RvcmllcyAtIHdoaWNoIGpzb24gZmlsZXMgc2hvdWxkIHdlIHJlYWQ/XHJcbiAgICAgIC8vIGZvciBlYWNoIGdyb3VwLCBmZXRjaCB0aGUganNvbiBmaWxlIGFuZCBwb3B1bGF0ZSB0aGUgb3B0Z3JvdXAgYW5kIG9wdGlvbiBlbGVtZW50cyBhcyBjaGlsZHJlbiBvZiB0aGUgYXBwcm9wcmlhdGUgbWVudSBlbGVtZW50XHJcbiAgICAgIHZhciBsaXN0ID0gW1wia2ZhcnJfYmFzZXNcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fdmVoXCIsXHJcbiAgICAgICAgICAgICAgXCJtbW1tX2JsZFwiLFxyXG4gICAgICAgICAgICAgIFwibW1tbV9jaHJcIixcclxuICAgICAgICAgICAgICBcIm1tbW1fYWxpZW5cIixcclxuICAgICAgICAgICAgICBcIm1tbW1fc2NlbmVcIlxyXG4gICAgICAgICAgICBdO1xyXG5cclxuICAgICAgdmFyIGdyb3VwSlNPTkFycmF5ID0gW107XHJcbiAgICAgIGNvbnN0IG1lbnVJZCA9IHRoaXMuZGF0YS5tZW51SWQ7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiYnVpbGRlci1jb250cm9scyBtZW51SWQ6IFwiICsgbWVudUlkKTtcclxuXHJcbiAgICAgIC8vIFRPRE86IHdyYXAgdGhpcyBpbiBwcm9taXNlIGFuZCB0aGVuIHJlcXVlc3QgYWZyYW1lLXNlbGVjdC1iYXIgY29tcG9uZW50IHRvIHJlLWluaXQgd2hlbiBkb25lIGxvYWRpbmdcclxuICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChncm91cE5hbWUsIGluZGV4KSB7XHJcbiAgICAgICAgLy8gZXhjZWxsZW50IHJlZmVyZW5jZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9KYXZhU2NyaXB0L09iamVjdHMvSlNPTlxyXG4gICAgICAgIHZhciByZXF1ZXN0VVJMID0gJ2Fzc2V0cy8nICsgZ3JvdXBOYW1lICsgXCIuanNvblwiO1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCByZXF1ZXN0VVJMKTtcclxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdqc29uJztcclxuICAgICAgICByZXF1ZXN0LnNlbmQoKTtcclxuXHJcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy8gZm9yIGVhY2ggZ3JvdXBsaXN0IGpzb24gZmlsZSB3aGVuIGxvYWRlZFxyXG4gICAgICAgICAgZ3JvdXBKU09OQXJyYXlbZ3JvdXBOYW1lXSA9IHJlcXVlc3QucmVzcG9uc2U7XHJcbiAgICAgICAgICAvLyBsaXRlcmFsbHkgYWRkIHRoaXMgc2hpdCB0byB0aGUgZG9tIGR1ZGVcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwSlNPTkFycmF5W2dyb3VwTmFtZV0pO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJncm91cE5hbWU6IFwiICsgZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAvLyBmaW5kIHRoZSBvcHRncm91cCBwYXJlbnQgZWxlbWVudCAtIHRoZSBtZW51IG9wdGlvbj9cclxuICAgICAgICAgIHZhciBtZW51RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChtZW51SWQpO1xyXG5cclxuICAgICAgICAgIC8vIGFkZCB0aGUgcGFyZW50IG9wdGdyb3VwIG5vZGUgbGlrZTogPG9wdGdyb3VwIGxhYmVsPVwiQWxpZW5zXCIgdmFsdWU9XCJtbW1tX2FsaWVuXCI+XHJcbiAgICAgICAgICB2YXIgbmV3T3B0Z3JvdXBFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRncm91cFwiKTtcclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuc2V0QXR0cmlidXRlKFwibGFiZWxcIiwgaHVtYW5pemUoZ3JvdXBOYW1lKSk7IC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGEgcHJldHRpZXIgbGFiZWwsIG5vdCB0aGUgZmlsZW5hbWVcclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAvLyBjcmVhdGUgZWFjaCBjaGlsZFxyXG4gICAgICAgICAgdmFyIG9wdGlvbnNIVE1MID0gXCJcIjtcclxuICAgICAgICAgIGdyb3VwSlNPTkFycmF5W2dyb3VwTmFtZV0uZm9yRWFjaCggZnVuY3Rpb24ob2JqZWN0RGVmaW5pdGlvbiwgaW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl0pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhvYmplY3REZWZpbml0aW9uKTtcclxuICAgICAgICAgICAgb3B0aW9uc0hUTUwgKz0gYDxvcHRpb24gdmFsdWU9XCIke29iamVjdERlZmluaXRpb25bXCJmaWxlXCJdfVwiIHNyYz1cImFzc2V0cy9wcmV2aWV3LyR7b2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl19LmpwZ1wiPiR7aHVtYW5pemUob2JqZWN0RGVmaW5pdGlvbltcImZpbGVcIl0pfTwvb3B0aW9uPmBcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIG5ld09wdGdyb3VwRWwuaW5uZXJIVE1MID0gb3B0aW9uc0hUTUw7XHJcbiAgICAgICAgICAvLyBUT0RPOiBCQUQgV09SS0FST1VORCBUTyBOT1QgUkVMT0FEIEJBU0VTIHNpbmNlIGl0J3MgZGVmaW5lZCBpbiBIVE1MLiBJbnN0ZWFkLCBubyBvYmplY3RzIHNob3VsZCBiZSBsaXN0ZWQgaW4gSFRNTC4gVGhpcyBzaG91bGQgdXNlIGEgcHJvbWlzZSBhbmQgdGhlbiBpbml0IHRoZSBzZWxlY3QtYmFyIGNvbXBvbmVudCBvbmNlIGFsbCBvYmplY3RzIGFyZSBsaXN0ZWQuXHJcbiAgICAgICAgICBpZiAoZ3JvdXBOYW1lID09IFwia2ZhcnJfYmFzZXNcIikge1xyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIC0gZG9uJ3QgYXBwZW5kIHRoaXMgdG8gdGhlIERPTSBiZWNhdXNlIG9uZSBpcyBhbHJlYWR5IHRoZXJlXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtZW51RWwuYXBwZW5kQ2hpbGQobmV3T3B0Z3JvdXBFbCk7XHJcbiAgICAgICAgICB9XHJcbi8vICAgICAgICAgIHJlc29sdmU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMuZ3JvdXBKU09OQXJyYXkgPSBncm91cEpTT05BcnJheTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBlbnRpdHkgcmVzdW1lcy5cclxuICAgKiBVc2UgdG8gY29udGludWUgb3IgYWRkIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGxheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGVudGl0eSBwYXVzZXMuXHJcbiAgICogVXNlIHRvIHN0b3Agb3IgcmVtb3ZlIGFueSBkeW5hbWljIG9yIGJhY2tncm91bmQgYmVoYXZpb3Igc3VjaCBhcyBldmVudHMuXHJcbiAgICovXHJcbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIGNvbXBvbmVudCBpcyByZW1vdmVkIChlLmcuLCB2aWEgcmVtb3ZlQXR0cmlidXRlKS5cclxuICAgKiBHZW5lcmFsbHkgdW5kb2VzIGFsbCBtb2RpZmljYXRpb25zIHRvIHRoZSBlbnRpdHkuXHJcbiAgICovXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU3Bhd25zIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgb2JqZWN0IGF0IHRoZSBjb250cm9sbGVyIGxvY2F0aW9uIHdoZW4gdHJpZ2dlciBwcmVzc2VkXHJcbiAgICovXHJcbiAgb25QbGFjZU9iamVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBJdGVtIGVsZW1lbnQgKHRoZSBwbGFjZWFibGUgY2l0eSBvYmplY3QpIHNlbGVjdGVkIG9uIHRoaXMgY29udHJvbGxlclxyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XHJcbiAgICB2YXIgdGhpc0l0ZW1FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpc0l0ZW1JRCk7XHJcblxyXG4gICAgLy8gV2hpY2ggb2JqZWN0IHNob3VsZCBiZSBwbGFjZWQgaGVyZT8gVGhpcyBJRCBpcyBcInN0b3JlZFwiIGluIHRoZSBET00gZWxlbWVudCBvZiB0aGUgY3VycmVudCBJdGVtXHJcblx0XHR2YXIgb2JqZWN0SWQgPSBwYXJzZUludCh0aGlzSXRlbUVsLmF0dHJpYnV0ZXMub2JqZWN0SWQudmFsdWUpO1xyXG5cclxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3Q/IEZvciBleGFtcGxlLCBcIm1tbW1fYWxpZW5cIiBvciBcImJhc2VzXCJcclxuXHRcdHZhciBvYmplY3RHcm91cCA9IHRoaXNJdGVtRWwuYXR0cmlidXRlcy5vYmplY3RHcm91cC52YWx1ZTtcclxuXHJcbiAgICAvLyByb3VuZGluZyB0cnVlIG9yIGZhbHNlPyBXZSB3YW50IHRvIHJvdW5kIHBvc2l0aW9uIGFuZCByb3RhdGlvbiBvbmx5IGZvciBcImJhc2VzXCIgdHlwZSBvYmplY3RzXHJcbiAgICB2YXIgcm91bmRpbmcgPSAob2JqZWN0R3JvdXAgPT0gJ2tmYXJyX2Jhc2VzJyk7XHJcblxyXG4gICAgLy8gR2V0IGFuIEFycmF5IG9mIGFsbCB0aGUgb2JqZWN0cyBvZiB0aGlzIHR5cGVcclxuICAgIHZhciBvYmplY3RBcnJheSA9IHRoaXMuZ3JvdXBKU09OQXJyYXlbb2JqZWN0R3JvdXBdO1xyXG5cclxuICAgIC8vIEdldCB0aGUgSXRlbSdzIGN1cnJlbnQgd29ybGQgY29vcmRpbmF0ZXMgLSB3ZSdyZSBnb2luZyB0byBwbGFjZSBpdCByaWdodCB3aGVyZSBpdCBpcyFcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUG9zaXRpb24gPSB0aGlzSXRlbUVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb24gPSB0aGlzSXRlbUVsLm9iamVjdDNELmdldFdvcmxkUm90YXRpb24oKTtcclxuXHRcdHZhciBvcmlnaW5hbFBvc2l0aW9uU3RyaW5nID0gdGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnggKyAnICcgKyB0aGlzSXRlbVdvcmxkUG9zaXRpb24ueSArICcgJyArIHRoaXNJdGVtV29ybGRQb3NpdGlvbi56O1xyXG5cclxuICAgIC8vIFJvdW5kIHRoZSBJdGVtJ3MgcG9zaXRpb24gdG8gdGhlIG5lYXJlc3QgMC41MCBmb3IgYSBiYXNpYyBcImdyaWQgc25hcHBpbmdcIiBlZmZlY3RcclxuXHRcdHZhciByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YID0gTWF0aC5yb3VuZCh0aGlzSXRlbVdvcmxkUG9zaXRpb24ueCAqIDIpIC8gMjsgLy9yb3VuZCB0byBuZWFyZXN0IDAuNSBmb3IgZ2hldHRvIFwic25hcHBpbmdcIlxyXG5cdFx0dmFyIHJvdW5kZWRJdGVtV29ybGRQb3NpdGlvblkgPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRQb3NpdGlvbi55ICogMikgLyAyOyAvL3JvdW5kIHRvIG5lYXJlc3QgMC41IGZvciBnaGV0dG8gXCJzbmFwcGluZ1wiXHJcblx0XHR2YXIgcm91bmRlZEl0ZW1Xb3JsZFBvc2l0aW9uWiA9IE1hdGgucm91bmQodGhpc0l0ZW1Xb3JsZFBvc2l0aW9uLnogKiAyKSAvIDI7IC8vcm91bmQgdG8gbmVhcmVzdCAwLjUgZm9yIGdoZXR0byBcInNuYXBwaW5nXCJcclxuXHRcdHZhciByb3VuZGVkUG9zaXRpb25TdHJpbmcgPSByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25YICsgJyAwLjUwICcgKyByb3VuZGVkSXRlbVdvcmxkUG9zaXRpb25aO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBjdXJyZW50IEl0ZW0ncyByb3RhdGlvbiBhbmQgY29udmVydCBpdCB0byBhIEV1bGVyIHN0cmluZ1xyXG5cdFx0dmFyIHRoaXNJdGVtV29ybGRSb3RhdGlvblggPSB0aGlzSXRlbVdvcmxkUm90YXRpb24uX3ggLyAoTWF0aC5QSSAvIDE4MCk7XHJcblx0XHR2YXIgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWSA9IHRoaXNJdGVtV29ybGRSb3RhdGlvbi5feSAvIChNYXRoLlBJIC8gMTgwKTtcclxuXHRcdHZhciB0aGlzSXRlbVdvcmxkUm90YXRpb25aID0gdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uLl96IC8gKE1hdGguUEkgLyAxODApO1xyXG5cdFx0dmFyIG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZyA9IHRoaXNJdGVtV29ybGRSb3RhdGlvblggKyAnICcgKyB0aGlzSXRlbVdvcmxkUm90YXRpb25ZICsgJyAnICsgdGhpc0l0ZW1Xb3JsZFJvdGF0aW9uWjtcclxuXHJcbiAgICAvLyBSb3VuZCB0aGUgSXRlbSdzIHJvdGF0aW9uIHRvIHRoZSBuZWFyZXN0IDkwIGRlZ3JlZXMgZm9yIGJhc2UgdHlwZSBvYmplY3RzXHJcblx0XHR2YXIgcm91bmRlZFRoaXNJdGVtV29ybGRSb3RhdGlvblkgPSBNYXRoLnJvdW5kKHRoaXNJdGVtV29ybGRSb3RhdGlvblkgLyA5MCkgKiA5MDsgLy8gcm91bmQgdG8gOTAgZGVncmVlc1xyXG5cdFx0dmFyIHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nID0gMCArICcgJyArIHJvdW5kZWRUaGlzSXRlbVdvcmxkUm90YXRpb25ZICsgJyAnICsgMDsgLy8gaWdub3JlIHJvbGwgYW5kIHBpdGNoXHJcblxyXG4gICAgdmFyIG5ld0lkID0gJ29iamVjdCcgKyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2l0eScpLmNoaWxkRWxlbWVudENvdW50O1xyXG4gICAgY29uc29sZS5sb2coXCJuZXdJZDpcIiArIG5ld0lkKTtcclxuICAgICQoJzxhLWVudGl0eSAvPicsIHtcclxuICAgICAgaWQ6IG5ld0lkLFxyXG4gICAgICBjbGFzczogJ2NpdHkgb2JqZWN0IGNoaWxkcmVuJyxcclxuICAgICAgc2NhbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgcm90YXRpb246IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgIGZpbGU6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAvLyBcInBseS1tb2RlbFwiOiBcInNyYzogdXJsKG5ld19hc3NldHMvXCIgKyBvYmplY3RBcnJheVtvYmplY3RJZF0uZmlsZSArIFwiLnBseSlcIixcclxuICAgICAgXCJvYmotbW9kZWxcIjogXCJvYmo6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5vYmopOyBtdGw6IHVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbb2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCIsXHJcbiAgICAgIGFwcGVuZFRvIDogJCgnI2NpdHknKVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG5ld09iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5ld0lkKTtcclxuICAgIG5ld09iamVjdC5zZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblwiLCByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcpOyAvLyB0aGlzIGRvZXMgc2V0IHBvc2l0aW9uXHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIFwiYmFzZXNcIiB0eXBlIG9iamVjdCwgYW5pbWF0ZSB0aGUgdHJhbnNpdGlvbiB0byB0aGUgc25hcHBlZCAocm91bmRlZCkgcG9zaXRpb24gYW5kIHJvdGF0aW9uXHJcbiAgICBpZiAocm91bmRpbmcpIHtcclxuICAgICAgbmV3T2JqZWN0LnNldEF0dHJpYnV0ZSgnYW5pbWF0aW9uJywgeyBwcm9wZXJ0eTogJ3JvdGF0aW9uJywgZHVyOiA1MDAsIGZyb206IG9yaWdpbmFsRXVsZXJSb3RhdGlvblN0cmluZywgdG86IHJvdW5kZWRFdWxlclJvdGF0aW9uU3RyaW5nIH0pXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGFub255bW91cyB0cmFja2luZyB1c2luZyBhbXBsaXR1ZGUuY29tLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2tmYXJyL2FmcmFtZS1jaXR5LWJ1aWxkZXIvaXNzdWVzLzE5XHJcbiAgICB2YXIgYW1wRXZlbnRQcm9wZXJ0aWVzID0ge1xyXG4gICAgICAnZmlsZSc6IG9iamVjdEFycmF5W29iamVjdElkXS5maWxlLFxyXG4gICAgICAncG9zaXRpb24nOiByb3VuZGluZyA/IHJvdW5kZWRQb3NpdGlvblN0cmluZyA6IG9yaWdpbmFsUG9zaXRpb25TdHJpbmcsXHJcbiAgICAgICdyb3RhdGlvbic6IHJvdW5kaW5nID8gcm91bmRlZEV1bGVyUm90YXRpb25TdHJpbmcgOiBvcmlnaW5hbEV1bGVyUm90YXRpb25TdHJpbmcsXHJcbiAgICAgICdzY2FsZSc6IG9iamVjdEFycmF5W29iamVjdElkXS5zY2FsZSxcclxuICAgICAgJ2lkJzogbmV3SWRcclxuICAgIH07XHJcbiAgICBhbXBsaXR1ZGUuZ2V0SW5zdGFuY2UoKS5sb2dFdmVudCgnUGxhY2UgT2JqZWN0JywgYW1wRXZlbnRQcm9wZXJ0aWVzKTtcclxuXHJcbiAgfSxcclxuXHJcblx0b25PYmplY3RDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwib25PYmplY3RDaGFuZ2UgdHJpZ2dlcmVkXCIpO1xyXG5cclxuICAgIC8vIEZldGNoIHRoZSBJdGVtIGVsZW1lbnQgKHRoZSBwbGFjZWFibGUgY2l0eSBvYmplY3QpIHNlbGVjdGVkIG9uIHRoaXMgY29udHJvbGxlclxyXG4gICAgdmFyIHRoaXNJdGVtSUQgPSAodGhpcy5lbC5pZCA9PT0gJ2xlZnRDb250cm9sbGVyJykgPyAnI2xlZnRJdGVtJzonI3JpZ2h0SXRlbSc7XHJcbiAgICB2YXIgdGhpc0l0ZW1FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpc0l0ZW1JRCk7XHJcblxyXG4gICAgdmFyIG1lbnVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuZGF0YS5tZW51SWQpO1xyXG5cclxuICAgIC8vIFdoYXQncyB0aGUgdHlwZSBvZiBvYmplY3QgY3VycmVudGx5IHNlbGVjdGVkPyBGb3IgZXhhbXBsZSwgXCJtbW1tX2FsaWVuXCIgb3IgXCJiYXNlc1wiXHJcbiAgICB2YXIgb2JqZWN0R3JvdXAgPSBtZW51RWwuY29tcG9uZW50c1snc2VsZWN0LWJhciddLnNlbGVjdGVkT3B0Z3JvdXBWYWx1ZTtcclxuXHJcbiAgICAvLyBHZXQgYW4gQXJyYXkgb2YgYWxsIHRoZSBvYmplY3RzIG9mIHRoaXMgdHlwZVxyXG4gICAgdmFyIG9iamVjdEFycmF5ID0gdGhpcy5ncm91cEpTT05BcnJheVtvYmplY3RHcm91cF07XHJcblxyXG4gICAgLy8gV2hhdCBpcyB0aGUgSUQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBpdGVtP1xyXG4gICAgdmFyIG5ld09iamVjdElkID0gcGFyc2VJbnQobWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvbkluZGV4KTtcclxuICAgIHZhciBzZWxlY3RlZE9wdGlvblZhbHVlID0gbWVudUVsLmNvbXBvbmVudHNbJ3NlbGVjdC1iYXInXS5zZWxlY3RlZE9wdGlvblZhbHVlO1xyXG5cclxuXHRcdC8vIFNldCB0aGUgcHJldmlldyBvYmplY3QgdG8gYmUgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBcInByZXZpZXdcIiBpdGVtXHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqLW1vZGVsJywgeyBvYmo6IFwidXJsKGFzc2V0cy9vYmovXCIgKyBvYmplY3RBcnJheVtuZXdPYmplY3RJZF0uZmlsZSArIFwiLm9iailcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRsOiBcInVybChhc3NldHMvb2JqL1wiICsgb2JqZWN0QXJyYXlbbmV3T2JqZWN0SWRdLmZpbGUgKyBcIi5tdGwpXCJ9KTtcclxuXHRcdHRoaXNJdGVtRWwuc2V0QXR0cmlidXRlKCdzY2FsZScsIG9iamVjdEFycmF5W25ld09iamVjdElkXS5zY2FsZSk7XHJcblx0XHR0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0SWQnLCBuZXdPYmplY3RJZCk7XHJcbiAgICB0aGlzSXRlbUVsLnNldEF0dHJpYnV0ZSgnb2JqZWN0R3JvdXAnLCBvYmplY3RHcm91cCk7XHJcbiAgICB0aGlzSXRlbUVsLmZsdXNoVG9ET00oKTtcclxuXHR9LFxyXG5cclxuICAvKipcclxuICAgKiBVbmRvIC0gZGVsZXRlcyB0aGUgbW9zdCByZWNlbnRseSBwbGFjZWQgb2JqZWN0XHJcbiAgICovXHJcbiAgb25VbmRvOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjaXR5Q2hpbGRFbGVtZW50Q291bnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2l0eScpLmNoaWxkRWxlbWVudENvdW50O1xyXG4gICAgaWYgKGNpdHlDaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcclxuICBcdFx0dmFyIHByZXZpb3VzT2JqZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvYmplY3RcIiArIChjaXR5Q2hpbGRFbGVtZW50Q291bnQgLSAxKSk7XHJcbiAgXHRcdHByZXZpb3VzT2JqZWN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNPYmplY3QpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvYnVpbGRlci1jb250cm9scy5qcyIsIi8qIGdsb2JhbCBBRlJBTUUsIFRIUkVFICovXHJcblxyXG4vKipcclxuICogTG9hZHMgYW5kIHNldHVwIGdyb3VuZCBtb2RlbC5cclxuICovXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZ3JvdW5kJywge1xyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvYmplY3RMb2FkZXI7XHJcbiAgICB2YXIgb2JqZWN0M0QgPSB0aGlzLmVsLm9iamVjdDNEO1xyXG4gICAgLy8gdmFyIE1PREVMX1VSTCA9ICdodHRwczovL2Nkbi5hZnJhbWUuaW8vbGluay10cmF2ZXJzYWwvbW9kZWxzL2dyb3VuZC5qc29uJztcclxuICAgIHZhciBNT0RFTF9VUkwgPSAnYXNzZXRzL2Vudmlyb25tZW50L2dyb3VuZC5qc29uJztcclxuICAgIGlmICh0aGlzLm9iamVjdExvYWRlcikgeyByZXR1cm47IH1cclxuICAgIG9iamVjdExvYWRlciA9IHRoaXMub2JqZWN0TG9hZGVyID0gbmV3IFRIUkVFLk9iamVjdExvYWRlcigpO1xyXG4gICAgb2JqZWN0TG9hZGVyLmNyb3NzT3JpZ2luID0gJyc7XHJcbiAgICBvYmplY3RMb2FkZXIubG9hZChNT0RFTF9VUkwsIGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgb2JqLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XHJcbiAgICAgICAgdmFsdWUubWF0ZXJpYWwuc2hhZGluZyA9IFRIUkVFLkZsYXRTaGFkaW5nO1xyXG4gICAgICB9KTtcclxuICAgICAgb2JqZWN0M0QuYWRkKG9iaik7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvZ3JvdW5kLmpzIiwiLyogZ2xvYmFsIEFGUkFNRSAqL1xyXG5BRlJBTUUucmVnaXN0ZXJTaGFkZXIoJ3NreUdyYWRpZW50Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3JUb3A6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ2JsYWNrJywgaXM6ICd1bmlmb3JtJyB9LFxyXG4gICAgY29sb3JCb3R0b206IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ3JlZCcsIGlzOiAndW5pZm9ybScgfVxyXG4gIH0sXHJcblxyXG4gIHZlcnRleFNoYWRlcjogW1xyXG4gICAgJ3ZhcnlpbmcgdmVjMyB2V29ybGRQb3NpdGlvbjsnLFxyXG5cclxuICAgICd2b2lkIG1haW4oKSB7JyxcclxuXHJcbiAgICAgICd2ZWM0IHdvcmxkUG9zaXRpb24gPSBtb2RlbE1hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG4gICAgICAndldvcmxkUG9zaXRpb24gPSB3b3JsZFBvc2l0aW9uLnh5ejsnLFxyXG5cclxuICAgICAgJ2dsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTsnLFxyXG5cclxuICAgICd9J1xyXG5cclxuICBdLmpvaW4oJ1xcbicpLFxyXG5cclxuICBmcmFnbWVudFNoYWRlcjogW1xyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvclRvcDsnLFxyXG4gICAgJ3VuaWZvcm0gdmVjMyBjb2xvckJvdHRvbTsnLFxyXG5cclxuICAgICd2YXJ5aW5nIHZlYzMgdldvcmxkUG9zaXRpb247JyxcclxuXHJcbiAgICAndm9pZCBtYWluKCknLFxyXG5cclxuICAgICd7JyxcclxuICAgICAgJ3ZlYzMgcG9pbnRPblNwaGVyZSA9IG5vcm1hbGl6ZSh2V29ybGRQb3NpdGlvbi54eXopOycsXHJcbiAgICAgICdmbG9hdCBmID0gMS4wOycsXHJcbiAgICAgICdpZihwb2ludE9uU3BoZXJlLnkgPiAtIDAuMil7JyxcclxuXHJcbiAgICAgICAgJ2YgPSBzaW4ocG9pbnRPblNwaGVyZS55ICogMi4wKTsnLFxyXG5cclxuICAgICAgJ30nLFxyXG4gICAgICAnZ2xfRnJhZ0NvbG9yID0gdmVjNChtaXgoY29sb3JCb3R0b20sY29sb3JUb3AsIGYgKSwgMS4wKTsnLFxyXG5cclxuICAgICd9J1xyXG4gIF0uam9pbignXFxuJylcclxufSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9za3lHcmFkaWVudC5qcyJdLCJzb3VyY2VSb290IjoiIn0=