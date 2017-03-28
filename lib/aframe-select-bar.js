/* aframe-select-bar component -- attempt to pull out select bar code from city builder logic */
"use strict";

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
function findWithAttr(array, attr, value) {  // find a
    for (var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
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
function loopIndex(desiredIndex, arrayLength) {   // expects a 0 based index
  if (desiredIndex > (arrayLength - 1)) {
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
var testLoopArray = [0,1,2,3,4,5,6,7,8,9];
assert(loopIndex(9, testLoopArray.length) == 9);
assert(loopIndex(10, testLoopArray.length) == 0);
assert(loopIndex(11, testLoopArray.length) == 1);
assert(loopIndex(0, testLoopArray.length) == 0);
assert(loopIndex(-1, testLoopArray.length) == 9);
assert(loopIndex(-2, testLoopArray.length) == 8);

AFRAME.registerComponent('select-bar', {
  schema: {
    controls: {type: 'boolean', default: true},
    controllerID: {type: 'string', default: 'rightController'},
    selectedOptgroupValue: {type: 'string'},            // not intended to be set when defining component, used for tracking state
    selectedOptgroupIndex: {type: 'int', default: 0},   // not intended to be set when defining component, used for tracking state
    selectedOptionValue: {type: 'string'},              // not intended to be set when defining component, used for tracking state
    selectedOptionIndex: {type: 'int', default: 0}      // not intended to be set when defining component, used for tracking state
  },

  // for a given optgroup, make the children
  makeSelectOptionsRow: function(selectedOptgroupEl, parentEl, index, offsetY, idPrefix) {

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
    var optionsElements = selectedOptgroupEl.getElementsByTagName("option");  // the actual JS children elements

    // convert the NodeList of matching option elements into a Javascript Array
    var optionsElementsArray = Array.prototype.slice.call(optionsElements);

    var firstArray = optionsElementsArray.slice(0,4); // get items 0 - 4
    var previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array

    // Combine into "menuArray", a list of currently visible options where the middle index is the currently selected object
    var menuArray = previewArray.concat(firstArray);

    var selectOptionsHTML = "";
    var startPositionX = -0.225;
    var deltaX = 0.075;

    // For each menu option, create a preview element and its appropriate children
    menuArray.forEach(function (element, menuArrayIndex) {
      var visible = (menuArrayIndex === 0 || menuArrayIndex === 6) ? (false) : (true);
      var selected = (menuArrayIndex === 3);
      // index of the optionsElementsArray where optionsElementsArray.element.getattribute("value") = element.getattribute("value")
      var originalOptionsArrayIndex = findWithAttr(optionsElementsArray, "value", element.getAttribute("value"));
      selectOptionsHTML += `
      <a-entity id="${idPrefix}${originalOptionsArrayIndex}" visible="${visible}" class="preview${ (selected) ? " selected" : ""}" optionid="${originalOptionsArrayIndex}" value="${element.getAttribute("value")}" optgroup="${selectedOptgroupEl.getAttribute("value")}" position="${startPositionX} ${offsetY} 0">
        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ${(selected) ? ("yellow") : ("#222222")}"></a-box>
        <a-image class="previewImage" scale="0.05 0.05 0.05" src="${element.getAttribute("src")}" ></a-image>
        <a-entity class="objectName" position="0.065 -0.04 -0.003" scale="0.18 0.18 0.18" text="value: ${element.text}; color: ${(selected) ? ("yellow") : ("#747474")}"></a-entity>
      </a-entity>`
      startPositionX += deltaX;
    });

    // Append these menu options to a new element with id of "selectOptionsRow"
    var selectOptionsRowEl = document.createElement("a-entity");
    selectOptionsRowEl.id = idPrefix + "selectOptionsRow" + index;
    selectOptionsRowEl.innerHTML = selectOptionsHTML;
    parentEl.appendChild(selectOptionsRowEl);

  },

  init: function () {
    // Create select bar menu from html child `option` elements beneath parent entity inspired by the html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
    var selectEl = this.el;  // Reference to the component's element.
    this.data.lastTime = new Date();

    // we want a consistent prefix when creating IDs
    // if the parent has an id, use that; otherwise, use the string "menu"
    this.idPrefix = selectEl.id ? selectEl.id : "menu";

    // Create the "frame" of the select menu bar
    var selectRenderEl = document.createElement("a-entity");
    selectRenderEl.id = this.idPrefix + "selectRender";
    selectRenderEl.innerHTML = `
      <a-box id="${this.idPrefix}Frame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>
      <a-entity id="${this.idPrefix}arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      <a-entity id="${this.idPrefix}arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>
      <a-entity id="${this.idPrefix}arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      <a-entity id="${this.idPrefix}arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      `;
    selectEl.appendChild(selectRenderEl);

    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
    var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup
    this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value

    // this.idPrefix
    console.log(this.idPrefix);
    console.log("this.attrName: " + this.attrName);
    console.log("this.id: " + this.id);

    this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.data.selectedOptgroupIndex, 0, this.idPrefix);

  },


  removeSelectOptionsRow: function (index) {
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


  addEventListeners: function () {
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
  removeEventListeners: function () {
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
  play: function () {
    this.addEventListeners();
  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () {
    this.removeEventListeners();
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    this.removeEventListeners();
  },

  onTriggerDown: function (evt) {
    if (evt.target.id != this.data.controllerID) {   //menu: only deal with trigger down events from correct controller
      return;
    }
    this.el.emit("menuSelected");
  },

  onAxisMove: function (evt) {       // menu: used for determining current axis of trackpad hover position
    if (evt.target.id != this.data.controllerID) {   //menu: only deal with trackpad events from correct controller
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
    if (Math.abs(evt.detail.axis[0]) > Math.abs(evt.detail.axis[1])) { // if x axis absolute value (left/right) is greater than y axis (down/up)
      if (evt.detail.axis[0] > 0) { // if the right axis is greater than 0 (midpoint)
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

      if (yAxis > 0) { // if the up axis is greater than 0 (midpoint)
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
              if ( Math.floor(thisTime - this.data.lastTime) > 500 ) {
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

  onHoverRight: function () {
    this.el.emit("menuHoverRight");
    var arrow = document.getElementById(this.idPrefix + "arrowRight");
    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
    if (currentArrowColor.r === 0) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
      arrow.removeAttribute('animation__color');
      arrow.removeAttribute('animation__opacity');
      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
    }
  },

  onHoverLeft: function () {
    this.el.emit("menuHoverLeft");
    var arrow = document.getElementById(this.idPrefix + "arrowLeft");
    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
    if (currentArrowColor.r === 0) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
      arrow.removeAttribute('animation__color');
      arrow.removeAttribute('animation__opacity');
      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
    }
  },

  onHoverDown: function () {
    this.el.emit("menuHoverDown");
    var selectEl = this.el;
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups

    console.log(this.idPrefix + "arrowDown");
    var arrow = document.getElementById(this.idPrefix + "arrowDown");
    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
    if ( !(currentArrowColor.r > 0 && currentArrowColor.g > 0) ) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
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

  onHoverUp: function () {
    this.el.emit("menuHoverUp");
    var selectEl = this.el;
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups

    var arrow = document.getElementById(this.idPrefix + "arrowUp");
    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
    if ( !(currentArrowColor.r > 0 && currentArrowColor.g > 0) ) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
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

  onOptionNext: function (evt) {
    this.onOptionSwitch("next");
  },

  onOptionPrevious: function (evt) {
    this.onOptionSwitch("previous");
  },

  onOptgroupNext: function(evt) {
    var selectEl = this.el;
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
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
      var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup
      this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value

      this.el.flushToDOM();

      var nextSelectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup
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

  onOptgroupPrevious: function(evt) {
    var selectEl = this.el;
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
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
      var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup
      this.data.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value

      this.el.flushToDOM();

      var nextSelectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup
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

  onTrackpadDown: function (evt) {
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

    if ( arrowColorArrayGreen.reduce((a, b) => a + b, 0) > 0) { // if at least one value is > 0
      switch (indexOfMax(arrowColorArrayGreen)) {         // Determine which value in the array is the largest
        case 0:        // up
          this.onOptgroupPrevious();
          console.log("PRESSup");
          return; // without this return the other cases are fired - weird!
        case 1:        // right
          this.onOptionSwitch("next");
          console.log("PRESSright");
          return;
        case 2:        // down
          this.onOptgroupNext();
          console.log("PRESSdown");
          return;
        case 3:        // left
          this.onOptionSwitch("previous");
          console.log("PRESSleft");
          return;
      }
    }

  },

  onOptionSwitch: function (direction) {
    console.log(this);
    console.log(this.data);
    // Switch to the next option, or switch in the direction of the most recently hovered directional arrow
    // menu: save the currently selected menu element
    // console.log("direction?");
    // console.log(direction);
    console.log(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);
    var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.data.selectedOptgroupIndex);

    const oldMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
    // console.log(oldMenuEl);

    var oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute("optionid"));
    var selectedOptionIndex = oldSelectedOptionIndex;
    // console.log(selectedOptionIndex);

    var selectEl = this.el;  // Reference to the component's entity.
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
    var selectedOptgroupEl = optgroups[this.data.selectedOptgroupIndex];  // fetch the currently selected optgroup

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
      const newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];

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
      newlyVisibleOptionEl.setAttribute('visible','true');
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
      newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x - 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
      newlyCreatedOptionEl.flushToDOM();

      // menu: add the newly cloned and modified menu object preview to the dom
      selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );

      // menu: get child elements for image and name, populate both appropriately
      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
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
      const newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];

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
      newlyVisibleOptionEl.setAttribute('visible','true');
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
      newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x + 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
      newlyCreatedOptionEl.flushToDOM();

      // menu: add the newly cloned and modified menu object preview
      selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );

      // menu: get child elements for image and name, populate both appropriately
      var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];

      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'value', sourceOptionEl.text);
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', '#747474');
      appendedNewlyCreatedOptionEl.flushToDOM();

      // NEXT MENU OPTION END ===============================
    }

  }

});
