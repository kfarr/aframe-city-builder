/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var objectCount = 0; // scene starts with 0 items
var bases = [
	{ file: 'base-grass', scale: '0.01 0.01 0.01' }, //0
	{ file: 'base-street', scale: '0.01 0.01 0.01' }, //1
	{ file: 'base-cross-street', scale: '0.01 0.01 0.01' }, //2
	{ file: 'scene_house6', scale: '0.00390625 0.00390625 0.00390625' }, //3
	{ file: 'scene_house5', scale: '0.004 0.004 0.004' }, //4
	{ file: 'scene_house2', scale: '0.004 0.004 0.004' }, //5  0.78125 * 0.005 = 0.00390625
	{ file: 'scene_park4', scale: '0.004 0.004 0.004' } //6	0.78125 * 0.01 = 0.0078125
];
var objects = [
	{ file: 'obj_treekf', scale: '0.01 0.01 0.01' }, //0
	{ file: 'obj_tree1', scale: '0.005 0.005 0.005' }, //1
	{ file: 'obj_trlight2', scale: '0.005 0.005 0.005' }, //2
	{ file: 'veh_ambulance', scale: '0.005 0.005 0.005' }, //3
	{ file: 'veh_truck1', scale: '0.005 0.005 0.005' }, //4
	{ file: 'veh_wagon1', scale: '0.005 0.005 0.005' }, //5
	{ file: 'veh_suv2', scale: '0.005 0.005 0.005' }, //6
	{ file: 'veh_mini3', scale: '0.005 0.005 0.005' }, //7
	{ file: 'veh_truck6', scale: '0.005 0.005 0.005' }, //8
	{ file: 'obj_store01', scale: '0.005 0.005 0.005' }, //9
	{ file: 'obj_house3', scale: '0.005 0.005 0.005' } //10
];


var objectDataStore = (function() {
    var objectJSON = [];
    console.log("objectJSON var initialized");

    $.ajax({
      type: "GET",
      url: "/assets/mmmm_alien.json",
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
      url: "/assets/kfarr_bases.json",
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

// console.log("try fetchJSON method on datastore object");
// // results = $(objectDataStore.fetchJSON());
// results = objectDataStore.fetchJSON();
// console.log("fetchJSON" + results);
// console.log(results);





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
    // Vive specific controls
		el.addEventListener('trackpaddown', this.onSwitchObject.bind(this));
    // Oculus Touch specific controls
    el.addEventListener('Xdown', this.onSwitchObject.bind(this));
    el.addEventListener('Adown', this.onSwitchObject.bind(this));
  },

  /**
   * Remove event listeners.
   */
  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('triggerdown', this.onPlaceObject);
    el.removeEventListener('gripdown', this.onUndo);
    el.removeEventListener('trackpaddown', this.onSwitchObject);
    el.removeEventListener('Xdown', this.onSwitchObject);
    el.removeEventListener('Adown', this.onSwitchObject);
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
		var objectType = thisItemEl.attributes.objectType.value;

    // rounding true or false? We want to round position and rotation only for "bases" type objects
    var rounding = (objectType == 'kfarr_bases');

    // Get an Array of all the objects of this type
    // TODO this should pass the type of object (such as "mmmm_alien" to the JSON fetcher)
    objectArray = objectDataStore.fetchJSON(objectType);

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
      console.log("kfarr_bases");
      newObject.setAttribute("animation", "property: rotation; dur: 500; from: " + originalEulerRotationString + ", to: " + roundedEulerRotationString)
    };

    // Increment the object counter so subsequent objects have the correct index
		objectCount += 1;
  },

	onSwitchObject: function () {
		// switch between the available object or bases

    // Fetch the Item element (the placeable city object) selected on this controller
    var thisItemID = (this.el.id === 'leftController') ? '#leftItem':'#rightItem';
    var thisItemEl = document.querySelector(thisItemID);

    // TODO - change this, see above array fetching
		var objectArray = eval(thisItemEl.attributes.objectType.value); // select the array of objects based on the preview object's objecType value
		var objectId = parseInt(thisItemEl.attributes.objectId.value);

		objectId += 1;
		if (objectId == objectArray.length) {objectId = 0}

		// Set this plate to be whatever is currently the "preview" item
    // TODO - fix this:
		thisItemEl.setAttribute('obj-model', 'obj', '#' + objectArray[objectId].file + '-obj');
		thisItemEl.setAttribute('obj-model', 'mtl', '#' + objectArray[objectId].file + '-mtl');
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
