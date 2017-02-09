# aframe-city-builder
A-Frame project demonstrating touch controls for building a VR city scene.

## Demo
<strong><a href="https://kfarr.github.io/aframe-city-builder">If you have an HTC Vive or Oculus Rift with accompanying controllers, click here to try it out now!</a></strong>

## Screenshots
<img src="./assets/images/screenshots.gif" />
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/assets/images/screenshot1.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/assets/images/screenshot2.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/assets/images/screenshot3.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/assets/images/screenshot4.png

## Feature Highlights
- Place voxel objects in a fun virtual city of your creation
- Navigate available voxel objects with a scrolling menu interface in VR
- Place base plates for streets, grass, parks and residential lots that snap to a simple grid layout
- Save and load your city to/from JSON format
- Support for Oculus Touch and HTC Vive Controllers (VR headset and controllers required)
- Convenience utilities in /utils for creating new object JSON groups for aspiring city voxel artists

## Changelog
- See history of newly added features here https://github.com/kfarr/aframe-city-builder/blob/master/CHANGELOG.md

## Credits
* most models made by Mike Judge, see more here: https://github.com/mikelovesrobots/mmmm
* table http://tf3dm.com/3d-model/table-65702.html
* tree and simple base plates created by kfarr using magicavoxel (https://ephtracy.github.io/)
* city builder text based on https://github.com/ngokevin/kframe/blob/master/components/text/examples/vaporwave/index.html

## wishlist
NOT IN THIS RELEASE
- load directly from voxel https://gist.github.com/JoshGalvin/398ad2339ad7ae93e72489684d599466 https://github.com/daishihmr/vox.js

- enable second controller
- new bases to fit scene (http://streetmix.net/kfarr/3/a-frame-city-builder-street-only)
- ability for select bar component to delay loading / init
- add promise to know when all objects are loaded (or fail)
- teleport https://chenzlabs.github.io/aframe-teleport-controls/sample/
- blender baking of AO texture and progressive application of AO textures after scene fully loaded
- support for google draco object compression
- scale large/small (and rotate?) with both grips being pressed (what would happen to undo?)
- add a small haptic feedback see: https://github.com/imgntn/jBow/blob/ab2d254f288c563f33e6ed745e41a72ee2b7f759/components/bow-and-arrow.js#L163
- create components from the useful a-frame stuff (menu switcher, save/load json, desktop dialog ui, message notification)
- placing a baseplate over another object should replace the baseplate, not place both on same location
  - use flushtodom to force update of position to DOM https://aframe.io/docs/0.4.0/components/debug.html#component-to-dom-serialization
- sound effects - commodore 64 style
- aframe city website - have a central registry of objects (json file is fine to start) that is not in index.html file ui inspiration - https://buffy.run/model/578e438962c6c80000ea4c5e -> this could be done without a server -> use a git based site builder service. register this as aframe.city
- try progressive enhancement to replace obj with baked ply after loading
- load new scenes without destroying original (load by appending) - does not handle collision case
- add support for google draco object compression
- add some clouds
- send a VR postcard to facebook / social media
- add sunlight day cycle as aframe component http://jeromeetienne.github.io/threex.daynight/examples/basic.html
- firebase or simple db storage for scenes in json or other format
- use a proper build process to combine and minify all the various libraries
- clear / delete (bulldozer?)
- adopt a palette or other creative user interface to choose categories of objects, it is tiresome to scroll past many objects
- integrate with http://streetmix.net/ to generate street blocks
- auth / storage service
- highlight currently overlapping grid location
- cars to follow prescribed course on roads
- user generated objects / global object store
- add aframe snowplay type support https://github.com/rondagdag/aframe-snow-play
- persistent multiuser world
- use geolocation api to with virtual citybuilder locations to create "mini second life"
- physics
- try isometric view on mobile / non-vr devices (examples https://github.com/aframevr/aframe/issues/84 and http://wafi.iit.cnr.it/webvis/lab/preview.php?gist_id=07b5887a1d57b40b6065)
- add non-flat lowpoly terrain like this example https://playcanvas.com/



## future cool objects to add
* more cool vehicles
* flying things
* more "bases" like intersection, left turn, right turn, green park only, pedestrian and bike path only
* more advanced light poles, signals, signs
* people
* trains

## License
* The A-Frame City Builder codebase is MIT License Copyright (c) 2016 Kieran Farr
* Most nice looking objects are made by Mike Judge from his <a href="https://github.com/mikelovesrobots/mmmm">"Mini Mike's Metro Minis" project</a> under the <a href="https://github.com/mikelovesrobots/mmmm/blob/master/LICENSE">Creative Commons License.</a>
