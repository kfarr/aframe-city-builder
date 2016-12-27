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

/**
 * Vive Controller Template component for A-Frame.
 * Modifed for A-Frame Dominoes.
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
   * Spawns the currently previewed object at the controller location when trigger pressed
   */
  onPlaceObject: function () {

    var sceneEl = d3.select(this.el.sceneEl);  //not sure how the a-scene element is returned with "sceneEl" ?
    var controllerEl = d3.select(this.el);
    var controllerID = controllerEl.attr('id');

    // Need the other controller element to update its sphere-collider
    var otherControllerID = (controllerID === 'leftController') ? '#rightController':'#leftController';
		var otherControllerEl = document.querySelector(otherControllerID);

		var thisItemID = (controllerID === 'leftController') ? '#leftItem':'#rightItem';
		var thisItemEl = document.querySelector(thisItemID);

    // Must use controller's world coordinates
		var thisItemWorldPosition = thisItemEl.object3D.getWorldPosition();
		var thisItemWorldRotation = thisItemEl.object3D.getWorldRotation();
		var originalPositionString = thisItemWorldPosition.x + ' ' + thisItemWorldPosition.y + ' ' + thisItemWorldPosition.z;

		var roundedItemWorldPositionX = Math.round(thisItemWorldPosition.x * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
		var roundedItemWorldPositionY = Math.round(thisItemWorldPosition.y * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
		var roundedItemWorldPositionZ = Math.round(thisItemWorldPosition.z * 2) / 2; //round to nearest 0.5 for ghetto "snapping"
		var roundedPositionString = roundedItemWorldPositionX + ' 0.50 ' + roundedItemWorldPositionZ;

		var thisItemWorldRotationX = thisItemWorldRotation._x / (Math.PI / 180);
		var thisItemWorldRotationY = thisItemWorldRotation._y / (Math.PI / 180);
		var thisItemWorldRotationZ = thisItemWorldRotation._z / (Math.PI / 180);
		var originalEulerRotationString = thisItemWorldRotationX + ' ' + thisItemWorldRotationY + ' ' + thisItemWorldRotationZ;

		var roundedThisItemWorldRotationY = Math.round(thisItemWorldRotationY / 90) * 90; // round to 90 degrees
		var roundedEulerRotationString = 0 + ' ' + roundedThisItemWorldRotationY + ' ' + 0; // ignore roll and pitch

		// which base (object) to place? this ID is "stored" in the dom element of this controller entity
		var objectId = parseInt(thisItemEl.attributes.objectId.value);

		var objectType = thisItemEl.attributes.objectType.value;
		var objectArray = eval(objectType);

		// experimental - check to see if there is already an object here with this value
		// var existingObject = document.querySelectorAll('[position*="' + roundedPositionString + '"]');
		// console.log(existingObject);

    var cityEl = d3.select("#city");

    cityEl.append('a-obj-model')
           .attr('id', 'object' + objectCount)
					 .attr('class', 'city object children')
           .attr('scale', objectArray[objectId].scale)
					 .attr('position', (objectType == 'bases') ? roundedPositionString : originalPositionString) // only round for base plates
					 .attr('rotation', (objectType == 'bases') ? roundedEulerRotationString : originalEulerRotationString) // only round for base plates
					 .attr('src', '#' + objectArray[objectId].file + '-obj')
					 .attr('mtl', '#' + objectArray[objectId].file + '-mtl')
					 .attr('file', objectArray[objectId].file);
					 	          //  .attr('class', 'throwable')
					 						//  .attr('dynamic-body', '') // make it physic-like

		var newObject = d3.select("#object" + objectCount);

		if(typeof newObject !== "undefined" && objectType == "bases"){
			newObject.transition()
	         .duration(500)
	         .attrTween('rotation', function() {
	           return d3.interpolate(originalEulerRotationString, roundedEulerRotationString);
	         });
		}

		objectCount += 1;
  },

	onSwitchObject: function () {
		// switch between the available object or bases

		// wonky logic to fetch the element representing the current Vive wand's "preview item"
		var controllerEl = d3.select(this.el);
    var controllerID = controllerEl.attr('id');
		var thisItemID = (controllerID === 'leftController') ? '#leftItem':'#rightItem';
		var thisItemEl = document.querySelector(thisItemID);

		var objectArray = eval(thisItemEl.attributes.objectType.value); // select the array of objects based on the preview object's objecType value
		var objectId = parseInt(thisItemEl.attributes.objectId.value);

		objectId += 1;
		if (objectId == objectArray.length) {objectId = 0}

		// Set this plate to be whatever is currently the "preview" item
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
  onOldGripDown: function () {
    var controllerEl = d3.select(this.el);
    var stickEl;

    // Keep track of UI open/close
    if (this.stickPresent) {
      // Remove stick
      stickEl = controllerEl.select('#stick');
      stickEl.transition()
                .duration(1000)
                .attr('opacity', '0')
                .remove();

      this.stickPresent = false;
    } else {
      // Add stick
      controllerEl.append('a-box')
                  .attr('id', 'stick')
                  .attr('opacity', '0')
                  // .attr('static-body', '')
                  .attr('width', '0.1')
                  .attr('height', '0.1')
                  .attr('depth', '1')
                  .attr('color', 'black')
                  .attr('position', '0 0 -1')
                    .transition()
                    .duration(1000)
                    .attr('opacity', '1');

      this.stickPresent = true;
    }
  }
});
