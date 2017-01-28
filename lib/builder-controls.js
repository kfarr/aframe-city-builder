/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var objectCount = 0; // scene starts with 0 items

function humanize(str) {
  var frags = str.split('_');
  for (i=0; i<frags.length; i++) {
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
    menuId: {type: "string", default: "menu"}
  },

  /**
   * Set if component needs multiple instancing.
   */
  multiple: false,

  /**
   * Add event listeners.
   */
  addEventListeners: function () {
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
  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('triggerdown', this.onPlaceObject);
    el.removeEventListener('gripdown', this.onUndo);
  },

  init: function () {
      // get the list of object group json directories - which json files should we read?
      // for each group, fetch the json file and populate the optgroup and option elements as children of the appropriate menu element
      list = ["kfarr_bases",
              "mmmm_veh",
              "mmmm_bld",
              "mmmm_alien",
              "mmmm_scene",
            ];

      var groupJSONArray = [];

      // TODO: wrap this in promise and then request aframe-select-bar component to re-init
      list.forEach(function (groupName, index) {
        // excellent reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
        var requestURL = 'assets/' + groupName + ".json";
        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        request.onload = function() { // for each grouplist json file when loaded
          groupJSONArray[groupName] = request.response;
          // literally add this shit to the dom dude
          console.log(groupJSONArray[groupName]);
          console.log("groupName: " + groupName);

          // find the optgroup parent element - the menu option?
          var menuEl = document.getElementById("menu");

          // add the parent optgroup node like: <optgroup label="Aliens" value="mmmm_alien">
          var newOptgroupEl = document.createElement("optgroup");
          newOptgroupEl.setAttribute("label", humanize(groupName)); // TODO: this should be a prettier label, not the filename
          newOptgroupEl.setAttribute("value", groupName);

          // create each child
          var optionsHTML = "";
          groupJSONArray[groupName].forEach( function(objectDefinition, index) {
            console.log(objectDefinition["file"]);
            console.log(objectDefinition);
            optionsHTML += `<option value="${objectDefinition["file"]}" src="assets/preview/${objectDefinition["file"]}.jpg" selected>${humanize(objectDefinition["file"])}</option>`
          });

          newOptgroupEl.innerHTML = optionsHTML;
          menuEl.appendChild(newOptgroupEl);
//          resolve;
        }
      });

      this.groupJSONArray = groupJSONArray;
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

  /**
   * Spawns the currently selected object at the controller location when trigger pressed
   */
  onPlaceObject: function () {

    // Fetch the Item element (the placeable city object) selected on this controller
    var thisItemID = (this.el.id === 'leftController') ? '#leftItem':'#rightItem';
    var thisItemEl = document.querySelector(thisItemID);

    // Which object should be placed here? This ID is "stored" in the DOM element of the current Item
		var objectId = parseInt(thisItemEl.attributes.objectId.value);

    // What's the type of object? For example, "mmmm_alien" or "bases"
		var objectGroup = thisItemEl.attributes.objectGroup.value;

    // rounding true or false? We want to round position and rotation only for "bases" type objects
    var rounding = (objectGroup == 'kfarr_bases');

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
      appendTo : $('#city')
    });

    newObject = document.getElementById(newId);
    newObject.setAttribute("position", rounding ? roundedPositionString : originalPositionString); // this does set position

    // If this is a "bases" type object, animate the transition to the snapped (rounded) position and rotation
    if (rounding) {
      newObject.setAttribute('animation', { property: 'rotation', dur: 500, from: originalEulerRotationString, to: roundedEulerRotationString })
    };

    // Increment the object counter so subsequent objects have the correct index
		objectCount += 1;
  },

	onObjectChange: function () {
    console.log("onObjectChange triggered");

    // Fetch the Item element (the placeable city object) selected on this controller
    var thisItemID = (this.el.id === 'leftController') ? '#leftItem':'#rightItem';
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
                                          mtl: "url(assets/obj/" + objectArray[newObjectId].file + ".mtl)"});
		thisItemEl.setAttribute('scale', objectArray[newObjectId].scale);
		thisItemEl.setAttribute('objectId', newObjectId);
    thisItemEl.setAttribute('objectGroup', objectGroup);
    thisItemEl.flushToDOM();
	},

  /**
   * Undo - deletes the most recently placed object
   */
  onUndo: function () {
		previousObject = document.querySelector("#object" + (objectCount - 1));
		previousObject.parentNode.removeChild(previousObject);
		objectCount -= 1;
		if(objectCount == -1) {objectCount = 0};
  }

});
