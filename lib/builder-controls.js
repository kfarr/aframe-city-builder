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

var objectDataStore = (function() {
    var objectJSON = [];
    console.log("objectJSON var initialized");

    $.ajax({
      type: "GET",
      url: "assets/mmmm_alien.json",
      dataType: "json",
      success : function(data) {
        objectJSON['mmmm_alien'] = data;
        console.log("objectJSON loaded:");
        console.log("objectJSON = " + objectJSON);
        console.log(objectJSON);
      }
    });

    $.ajax({
      type: "GET",
      url: "assets/mmmm_veh.json",
      dataType: "json",
      success : function(data) {
        objectJSON['mmmm_veh'] = data;
        console.log("objectJSON loaded:");
        console.log("objectJSON = " + objectJSON);
        console.log(objectJSON);
      }
    });

    $.ajax({
      type: "GET",
      url: "assets/kfarr_bases.json",
      dataType: "json",
      success : function(data) {
        objectJSON['kfarr_bases'] = data;
        console.log("objectJSON loaded:");
        console.log("objectJSON = " + objectJSON);
        console.log(objectJSON);
      }
    });

    return {fetchJSON : function(objectGroup)
    {
        console.log("fetchJSON fired");
        if (objectJSON) return objectJSON[objectGroup];
          return false; // else show some error that it isn't loaded yet;
    }};
})();

/**
 * Vive Controller Template component for A-Frame.
 * Modifed from A-Frame Dominoes.
 */
AFRAME.registerComponent('builder-controls', {
  schema: {},

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
    el.addEventListener('menudown', this.onObjectPrevious.bind(this));
    // Vive specific controls
//		el.addEventListener('trackpaddown', this.onObjectNext.bind(this));
    // Oculus Touch specific controls
    el.addEventListener('Xdown', this.onObjectNext.bind(this));
    // el.addEventListener('Adown', this.onObjectNext.bind(this));
    var menuEl = document.getElementById("menu");
    menuEl.addEventListener('menuNext', this.onObjectNext.bind(this));
  },

  /**
   * Remove event listeners.
   */
  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('triggerdown', this.onPlaceObject);
    el.removeEventListener('gripdown', this.onUndo);
    el.removeEventListener('menudown', this.onObjectPrevious);
    el.removeEventListener('trackpaddown', this.onObjectNext);
    el.removeEventListener('Xdown', this.onObjectNext);
    // el.removeEventListener('Adown', this.onObjectNext);
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
    var objectArray = objectDataStore.fetchJSON(objectGroup);

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

	onObjectNext: function () {
    return;
		// switch between the available object or bases

    // Fetch the Item element (the placeable city object) selected on this controller
    var thisItemID = (this.el.id === 'leftController') ? '#leftItem':'#rightItem';
    var thisItemEl = document.querySelector(thisItemID);

    // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
		var objectGroup = thisItemEl.attributes.objectGroup.value;

    // Get an Array of all the objects of this type
    var objectArray = objectDataStore.fetchJSON(objectGroup);

    // What is the ID of the currently selected item?
    var objectId = parseInt(thisItemEl.attributes.objectId.value);

    // // should we switch left or right?
    // var leftButton = new THREE.Color(document.getElementById("arrowRight").getAttribute("material").color).g < new THREE.Color(document.getElementById("arrowLeft").getAttribute("material").color).g;
    // console.log("leftButton? " + leftButton);

    // // IF RIGHT CONTROLLER
    // if (this.el.id === 'rightController') {
    //   // TEST FOR LEFT OR RIGHT BUTTON PRESS
    //   if (leftButton) {
    //     // LEFT BUTTON MENU START ===============================
    //     objectId -= 1;
    //     if (objectId == -1) {objectId = objectArray.length - 1}
    //   }
    // } else {
    //     // IF LEFT CONTROLLER
    //     objectId += 1;
    //     if (objectId == objectArray.length) {objectId = 0}
    // }

    objectId += 1;
    if (objectId == objectArray.length) {objectId = 0}

		// Set the preview object to be the currently selected "preview" item
    thisItemEl.setAttribute('obj-model', { obj: "url(assets/obj/" + objectArray[objectId].file + ".obj)",
                                          mtl: "url(assets/obj/" + objectArray[objectId].file + ".mtl)"});
		thisItemEl.setAttribute('scale', objectArray[objectId].scale);
		thisItemEl.setAttribute('objectId', objectId);

	},

  onObjectPrevious: function () {
    // switch between the available object or bases

    // Fetch the Item element (the placeable city object) selected on this controller
    var thisItemID = (this.el.id === 'leftController') ? '#leftItem':'#rightItem';
    var thisItemEl = document.querySelector(thisItemID);

    // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
    var objectGroup = thisItemEl.attributes.objectGroup.value;

    // Get an Array of all the objects of this type
    var objectArray = objectDataStore.fetchJSON(objectGroup);

    // What is the ID of the currently selected item?
    var objectId = parseInt(thisItemEl.attributes.objectId.value);

    // Decrement by 1 and start over at last object if reached the beginning
    objectId -= 1;
    if (objectId == -1) {objectId = objectArray.length - 1}

    // Set the next object to be the currently selected "preview" item
    thisItemEl.setAttribute('obj-model', { obj: "url(assets/obj/" + objectArray[objectId].file + ".obj)",
                                          mtl: "url(assets/obj/" + objectArray[objectId].file + ".mtl)"});
    thisItemEl.setAttribute('scale', objectArray[objectId].scale);
    thisItemEl.setAttribute('objectId', objectId);

  },

  /**
   * Undo - deletes the most recently placed object
   */
  onUndo: function () {
		previousObject = document.querySelector("#object" + (objectCount - 1));
		previousObject.parentNode.removeChild(previousObject);
		objectCount -= 1;
		if(objectCount == -1) {objectCount = 0};
  },

  /**
   * Summons a stick (for reach) - legacy from dominoes project
   *
   */
//   onOldGripDown: function () {
//     var controllerEl = d3.select(this.el);
//     var stickEl;
//
//     // Keep track of UI open/close
//     if (this.stickPresent) {
//       // Remove stick
//       stickEl = controllerEl.select('#stick');
//       stickEl.transition()
//                 .duration(1000)
//                 .attr('opacity', '0')
//                 .remove();
//
//       this.stickPresent = false;
//     } else {
//       // Add stick
//       controllerEl.append('a-box')
//                   .attr('id', 'stick')
//                   .attr('opacity', '0')
//                   // .attr('static-body', '')
//                   .attr('width', '0.1')
//                   .attr('height', '0.1')
//                   .attr('depth', '1')
//                   .attr('color', 'black')
//                   .attr('position', '0 0 -1')
//                     .transition()
//                     .duration(1000)
//                     .attr('opacity', '1');
//
//       this.stickPresent = true;
//     }
//   }

});
