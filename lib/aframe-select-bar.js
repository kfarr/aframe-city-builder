/* aframe-select-bar component -- attempt to pull out select bar code from city builder logic */

/* for testing in console:
menuEl = document.getElementById("menu");
menuEl.emit("onOptionNext");
menuEl.emit("onOptionPrevious");

*/

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

function loopIndex(desiredIndex, arrayLength) {   // expects a 0 based index
  if (desiredIndex > (arrayLength - 1)) {
    return desiredIndex - arrayLength;
  }
  if (desiredIndex < 0) {
    return arrayLength + desiredIndex;
  }
  return desiredIndex;
}

// Ghetto testing of loopIndex
function assert(condition, message) {
    console.log(condition.stringify);
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
testLoopArray = [0,1,2,3,4,5,6,7,8,9];
assert(loopIndex(9, testLoopArray.length) == 9);
assert(loopIndex(10, testLoopArray.length) == 0);
assert(loopIndex(11, testLoopArray.length) == 1);
assert(loopIndex(0, testLoopArray.length) == 0);
assert(loopIndex(-1, testLoopArray.length) == 9);
assert(loopIndex(-2, testLoopArray.length) == 8);

var optionJSON = [];  // ghetto way to declare global var for available options and option groups

AFRAME.registerComponent('select-bar', {
  schema: {
    controls: {type: 'boolean', default: true},
    controllerID: {type: 'string', default: "rightController"}
  },

  fetchOptionGroups: function () {
    var selectEl = this.el;  // Reference to the component's entity.
    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
    console.log(optgroups);

    Array.from(optgroups).forEach(function (element, index) {
      optionJSON[element.getAttribute("value")] = element; // this populates optionJSON with optgroup elements stored as keys of the "value" attribute
    });

    return optionJSON;
  },

  init: function () {
    // Create select bar menu from html child `option` elements beneath parent entity per html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp

    var selectEl = this.el;  // Reference to the component's entity.

    // What are the select menu options provided in the html? Assumes lists of 7 or greater!
    optGroups = this.fetchOptionGroups();
    console.log(optGroups);
    selectedOptgroup = optGroups['mmmm_alien'];

    // Create the "frame" of the select menu bar
    var selectRenderEl = document.createElement("a-entity");
    selectRenderEl.id = "selectRender";
    selectRenderEl.innerHTML = `
      <a-box id="menuFrame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>
      <a-entity id="groupText" position="-0.18 0.045 -0.003" scale="0.125 0.125 0.125" bmfont-text="text: ${selectedOptgroup.getAttribute('label')}; color: #747474"></a-entity>
      <a-entity id="arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      <a-entity id="arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>
      <a-entity id="arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      <a-entity id="arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
      `;
    selectEl.appendChild(selectRenderEl);

    // for a given optgroup, make the childrens

    // 5 or 6 may work, needs testing
    // 4 and below should be no scroll
    var optionsElements = selectedOptgroup.getElementsByTagName("option");  // the actual JS children elements
    // console.log(optionsElements);
    // var optionsElements = [0,1,2,3,4,5,6,7,8,9,10];

    // convert the NodeList of matching option elements into a Javascript Array
    var optionsElementsArray = Array.prototype.slice.call(selectedOptgroup.getElementsByTagName("option"));

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
      selectOptionsHTML += `
      <a-entity id="menu${element.getAttribute("index")}" visible="${visible}" class="preview${ (selected) ? " selected" : ""}" optionid="${menuArrayIndex}" value="${element.getAttribute("value")}" optgroup="${selectedOptgroup.getAttribute("value")}" position="${startPositionX} 0 0">
        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ${(selected) ? ("yellow") : ("#222222")}"></a-box>
        <a-image class="previewImage" scale="0.05 0.05 0.05" src="${element.getAttribute("src")}" ></a-image>
        <a-entity class="objectName" position="-0.025 -0.04 -0.003" scale="0.05 0.05 0.05" bmfont-text="text: ${element.text}; color: ${(selected) ? ("yellow") : ("#747474")}"></a-entity>
      </a-entity>`
      startPositionX += deltaX;
    });

    // Append these menu options to a new element with id of "selectOptionsRow"
    var selectOptionsRowEl = document.createElement("a-entity");
    selectOptionsRowEl.id = "selectOptionsRow";
    selectOptionsRowEl.innerHTML = selectOptionsHTML;
    selectRenderEl.appendChild(selectOptionsRowEl);
  },

  addEventListeners: function () {
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
    el.addEventListener('onOptionNext', this.onOptionNext.bind(this));
    el.addEventListener('onOptionPrevious', this.onOptionPrevious.bind(this));
//    el.addEventListener('onOptGroupNext', this.onOptionPrevious.bind(this));
//    el.addEventListener('onOptGroupPrevious', this.onOptionPrevious.bind(this));

  },

  /**
   * Remove event listeners.
   */
  removeEventListeners: function () {
    if (this.data.controls && this.data.controllerID) {
      controllerEl = document.getElementById(this.data.controllerID);
      controllerEl.removeEventListener('trackpaddown', this.onOptionSwitch);
      controllerEl.removeEventListener('axismove', this.onAxisMove);
    }

    var el = this.el;
    el.removeEventListener('onOptionSwitch', this.onOptionSwitch);
    el.removeEventListener('onHoverRight', this.onHoverRight);
    el.removeEventListener('onHoverLeft', this.onHoverLeft);
    el.removeEventListener('onOptionNext', this.onOptionNext);
    el.removeEventListener('onOptionPrevious', this.onOptionPrevious);

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

  onAxisMove: function (evt) {       // menu: used for determining current axis of trackpad hover position
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

    // if using the oculus rift and the thumbstick is >85% in either right/left direction then fire a trackpaddown event
    var gamepads = navigator.getGamepads();
    // here check if oculus controller, emit trackpaddown
    if (gamepads) {
      for (var i = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (gamepad) {
          if (gamepad.id.indexOf('Oculus Touch') === 0) {
            if (Math.abs(evt.detail.axis[0]) > 0.85) {
              this.emit('trackpaddown');
              return;   // only fire on first touch controller match, as there are 2
            }
          }
        }
      }
    }
  },

  onHoverRight: function () {
    this.el.emit("menuHoverRight");
    var arrow = document.getElementById("arrowRight");
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
    var arrow = document.getElementById("arrowLeft");
    var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
    if (currentArrowColor.r === 0) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
      arrow.removeAttribute('animation__color');
      arrow.removeAttribute('animation__opacity');
      arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
      arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
    }
  },

  onOptionNext: function (evt) {
    this.el.emit("menuNext");
    this.onOptionSwitch(evt, "next");
  },

  onOptionPrevious: function (evt) {
    this.el.emit("menuPrevious");
    this.onOptionSwitch(evt, "previous");
  },

  onOptGroupNext: function(evt) {
    // what is current optgroup?
    // what is "next" optgroup?
    // prepare optgroup
    // move it up
    return;
  },

  onOptionSwitch: function (evt, direction) {
    // Switch to the next option, or switch in the direction of the most recently hovered directional arrow
    // menu: save the currently selected menu element
    console.log("direction?");
    console.log(direction);
    const oldMenuEl = document.getElementById('selectOptionsRow').getElementsByClassName('selected')[0];
    console.log(oldMenuEl);

    var oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute("optionid"));
    var selectedOptionIndex = oldSelectedOptionIndex;
    console.log(selectedOptionIndex);

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

    var selectEl = this.el;  // Reference to the component's entity.
    var selectedOptgroupEl = this.fetchOptionGroups()['mmmm_alien']; // TODO selected Optgroup should be dynamic

    if (direction == 'previous') {
      // PREVIOUS OPTION MENU START ===============================
      selectedOptionIndex = loopIndex(selectedOptionIndex -= 1, selectedOptgroupEl.childElementCount);
      console.log(selectedOptionIndex);

      // menu: animate arrow LEFT
      var arrowLeft = document.getElementById("arrowLeft");
      arrowLeft.removeAttribute('animation__color');
      arrowLeft.removeAttribute('animation__opacity');
      arrowLeft.removeAttribute('animation__scale');
      arrowLeft.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
      arrowLeft.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
      arrowLeft.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });

      // menu: get the newly selected menu element
      const newMenuEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];

      // menu: remove selected class and change colors
      oldMenuEl.classList.remove("selected");
      newMenuEl.classList.add("selected");
      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
      newMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
      oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
      newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');

      // menu: slide the menu list row RIGHT by 1
      const selectOptionsRowEl = document.querySelector("#selectOptionsRow");
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
      var newlyVisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];

      // make visible and animate
      newlyVisibleOptionEl.setAttribute('visible','true');
      newlyVisibleOptionEl.removeAttribute('animation');
      newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
      newlyVisibleOptionEl.flushToDOM();

      // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
      var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
      var newlyRemovedOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
      newlyRemovedOptionEl.flushToDOM();
      newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);

      // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
      var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 2, selectedOptgroupEl.childElementCount);
      var newlyInvisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
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
      newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x - 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
      newlyCreatedOptionEl.flushToDOM();

      // menu: add the newly cloned and modified menu object preview to the dom
      selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );

      // menu: get child elements for image and name, populate both appropriately
      var appendedNewlyCreatedOptionEl = document.getElementById("menu" + newlyCreatedOptionIndex);
      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'text', sourceOptionEl.text);
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
      appendedNewlyCreatedOptionEl.flushToDOM();

    // PREVIOUS OPTION MENU END ===============================

    } else {
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
      const newMenuEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];

      // menu: remove selected class and change colors
      oldMenuEl.classList.remove("selected");
      newMenuEl.classList.add("selected");
      oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'gray');
      newMenuEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', 'yellow');
      oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
      newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');

      // menu: slide the menu list left by 1
      const selectOptionsRowEl = document.querySelector("#selectOptionsRow");
      // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
      // TODO - error with this code when looping through index

      console.log("'true' old position");
      console.log(selectOptionsRowEl.object3D.position);

      if (selectOptionsRowEl.hasAttribute("desiredPosition")) {
        console.log('desiredPosition');
        var oldPosition = selectOptionsRowEl.getAttribute("desiredPosition");
        console.log(oldPosition);
        var newX = parseFloat(oldPosition.split(" ")[0]) - 0.075;
        var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
        console.log(newPositionString);
      } else {
        var oldPosition = selectOptionsRowEl.object3D.position;
        var newX = oldPosition.x - 0.075; // this could be a variable soon
        var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
        console.log(newPositionString);
      }
      selectOptionsRowEl.removeAttribute('animation__slide');
      selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
      selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);

      // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
      var newlyVisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
      var newlyVisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];

      // make visible and animate
      newlyVisibleOptionEl.setAttribute('visible','true');
      newlyVisibleOptionEl.removeAttribute('animation');
      newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
      newlyVisibleOptionEl.flushToDOM();

      // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
      var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
      var newlyRemovedOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
      newlyRemovedOptionEl.flushToDOM();
      newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);

      // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
      var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex - 2, selectedOptgroupEl.childElementCount);
      var newlyInvisibleOptionEl = document.getElementById('selectOptionsRow').querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
      newlyInvisibleOptionEl.setAttribute('visible', 'false');
      newlyInvisibleOptionEl.flushToDOM();

      // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
      var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
      newlyCreatedOptionEl.setAttribute('visible', 'false');
      var newlyCreatedOptionIndex = loopIndex(oldSelectedOptionIndex + 4, selectedOptgroupEl.childElementCount);

      // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
      var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];

      newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
      newlyCreatedOptionEl.setAttribute('id', 'menu' + newlyCreatedOptionIndex);
      newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));

      var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
      newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x + 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
      newlyCreatedOptionEl.flushToDOM();

      // menu: add the newly cloned and modified menu object preview
      selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );

      // menu: get child elements for image and name, populate both appropriately
      var appendedNewlyCreatedOptionEl = document.getElementById("menu" + newlyCreatedOptionIndex);
      appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'text', sourceOptionEl.text);
      appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('bmfont-text', 'color', '#747474');
      appendedNewlyCreatedOptionEl.flushToDOM();

      // NEXT MENU OPTION END ===============================
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
