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
    menuEl.addEventListener('menuSelected', this.onActionSelect.bind(this));
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

  onActionSelect: function () {
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
        saveButton({overwrite: true});
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
        document.getElementById("title").setAttribute("text__cityname", "value", "#NewCity")
        document.title = "aframe.city";
        return;
    }
  },

  onActionChange: function () {
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
        var controlEl = this.el;
        // console.log("controlEl:");
        // console.log(controlEl);
        // Add attribute from this html: teleport-controls="button: trigger; collisionEntities: #ground"
        controlEl.setAttribute("teleport-controls", "button: trigger; collisionEntities: #ground");
        return; // without this return the other cases are fired - weird!
    }
  },

  handleActionEnd: function(optionValue) {
    // for given optionValue, do something
    switch (optionValue) {
      case "teleport":        // add teleport component to the control element that is the parent of this menu
        console.log("teleportEnd");
        var controlEl = this.el;
        // console.log("controlEl:");
        // console.log(controlEl);
        // Add attribute from this html: teleport-controls="button: trigger; collisionEntities: #ground"
        controlEl.removeAttribute("teleport-controls");
        return; // without this return the other cases are fired - weird!
    }
  }
});
