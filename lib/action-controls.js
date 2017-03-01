/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Game logic for controlling a-frame actions such as teleport and save
 */
AFRAME.registerComponent('action-controls', {
  schema: {
    menuID: {type: "string", default: "menu"}
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Add event listeners.
   */
  addEventListeners: function () {
    // get menu element associated with these controls
    var menuEl = document.getElementById(this.data.menuID);
    menuEl.addEventListener('menuChanged', this.onActionChange.bind(this));
    // menuEl.addEventListener('menuSelected', this.onPlaceObject.bind(this));
  },

  /**
   * Remove event listeners.
   */
  removeEventListeners: function () {
    var menuEl = document.getElementById(this.data.menuID);
    menuEl.removeEventListener('menuChanged', this.onActionChange);
    // menuEl.removeEventListener('menuSelected', this.onPlaceObject);
  },

  init: function () {
    console.log(this.data.menuID);
    var menuEl = document.getElementById(this.data.menuID);

    // if (typeof menuEl === 'undefined') { // this never happens because element exists at start of scene
    //   console.log("action-controls: menu element undefined");
    //   // Wait for select bar menu to init.
    //   var self = this;
    //   return setTimeout(function () {
    //     console.log("action-controls: init loop");
    //     self.init();
    //   });
    // }

    console.log("action-controls: menu element: " + menuEl);
    // get currently selected action
    var optionValue = menuEl.components['select-bar'].data.selectedOptionValue;
    console.log("optionValue" + optionValue);
    console.log(optionValue);

    // do the thing associated with the action
    this.handleActionStart(optionValue);
  },

  onActionSelect: function () {
    // what is the action

    // call the thing that does it
  },

  onActionChange: function () {
    // undo old one
    this.handleActionEnd(this.previousAction);

    var menuEl = document.getElementById(this.data.menuID);
    // get currently selected action
    var optionValue = menuEl.components['select-bar'].data.selectedOptionValue;
    console.log("new optionValue: " + optionValue);
    console.log(optionValue);
    // do new one
    this.handleActionStart(optionValue);
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

  handleActionStart: function(optionValue) {
    this.previousAction = optionValue;

    // for given optionValue, do something
    switch (optionValue) {
      case "teleport":        // add teleport component to the control element that is the parent of this menu
        console.log("teleportStart");
        // find control element that is the parent of this menu
        controlEl = this.el.parentElement;
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

  handleActionEnd: function(optionValue) {
    // caseswitch (optionValue) {
    //   case "teleport":        // add teleport component to the control element that is the parent of this menu
    //     // find control element that is the parent of this menu
    //     controlEl = this.el.parentElement;
    //     // Remove teleport controls attribute
    //     controlEl.removeAttribute("teleport-controls");
    //     return; // without this return the other cases are fired - weird!
    //   case "save":
    //     console.log("saveRemove");
    //     return;
    //   case "saveAs":
    //     console.log("saveAsRemove");
    //     return;
    //   case "new":
    //     console.log("newRemove");
    //     return;
    // }
    return;
  }
});
