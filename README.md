# aframe-draw
A-Frame project to play with Vive controls and drawing. Try out a demo now, Vive required for it to do anything useful:
https://kfarr.github.io/aframe-draw


### wishlist
* show a "preview" of the current object - 50% transparency?
* switch current object -> press trackpad button to see the "preview" change
* undo

## model credits:
* http://www.pearse.co.uk/lego/models/policecar.html
* http://tf3dm.com/3d-model/lego-car-8159-2-44445.html
* table http://tf3dm.com/3d-model/table-65702.html
* tree, street plate and grass plate created by kfarr using magicavoxel (https://ephtracy.github.io/)

## future nice functions
* add object
* switch / choose different object or category
* clear or delete
* save, load
* snap to grid for bases

## future cool objects
* cars, bikes, trucks
* buildings, houses
* parks, trees, light poles, signals, signs
* people
* trains
* bases: intersection, left turn, right turn, green park only, pedestrian and bike path only

debug copy/pasta

var controllerEl = document.querySelector("#leftController");
var controllerWorldPosition = controllerEl.object3D.getWorldPosition();

var controllerWorldQuaternion = this.el.object3D.getWorldQuaternion();
var controllerWorldRotation = this.el.object3D.getWorldRotation();

// controllerWorldPosition.y -= 0.1; // needed to get domino away from current controller's sphere-collider?
// controllerWorldPosition.z -= 0.1;
// <a-entity id="base-street" position="0 0.5 -1.0" scale="0.01 0.01 0.01" rotation="-90 0 0" ply-model="src: url(/assets/plate-streetv1.ply);"></a-entity>
// <a-obj-model src="#base-street-obj" mtl="#base-street-mtl" scale="0.01 0.01 0.01"></a-obj-model>
