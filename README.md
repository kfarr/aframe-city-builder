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

## wishlist
* load object list through json
* use preview images for next/previous objects
* ui to go forward / backward through the json list
* try progressive enhancement to replace obj with baked ply after loading
* try https://github.com/takahirox/aframe-outline component
* have a central registry of objects (json file is fine to start) that is not in index.html file ui inspiration - https://buffy.run/model/578e438962c6c80000ea4c5e
* support scroll right/left of objects via touch thumbstick/vive touchpad
* add some more fun placeable objects like pixel people and ufo's from <a href="https://github.com/mikelovesrobots/mmmm">mmmm</a>
* firebase or simple db storage for scenes in json or other format
* switch to all jquery and remove d3 dependency
* use a proper build process to combine and minify all the various libraries
* clear / delete (bulldozer?)
* adopt a palette or other creative user interface to choose categories of objects, it is tiresome to scroll past many objects
* "lazy loading" of objects only when necessary, right now all available objects are loaded at once
* integrate with http://streetmix.net/ to generate street blocks
* auth / storage service
* highlight currently overlapping grid location
* cars to follow prescribed course on roads
* user generated objects / global object store
* add aframe snowplay type support https://github.com/rondagdag/aframe-snow-play
* persistent multiuser world
* use geolocation api to with virtual citybuilder locations to create "mini second life"
* physics
* try isometric view on mobile / non-vr devices (examples https://github.com/aframevr/aframe/issues/84 and http://wafi.iit.cnr.it/webvis/lab/preview.php?gist_id=07b5887a1d57b40b6065)

## Changelog
See here https://github.com/kfarr/aframe-city-builder/blob/master/CHANGELOG.md

## model credits:
* most models made by Mike Judge, see more here: https://github.com/mikelovesrobots/mmmm
* table http://tf3dm.com/3d-model/table-65702.html
* tree and simple base plates created by kfarr using magicavoxel (https://ephtracy.github.io/)
* city builder text based on https://github.com/ngokevin/kframe/blob/master/components/text/examples/vaporwave/index.html

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
