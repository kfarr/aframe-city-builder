# aframe-city-builder
A-Frame project to play with Vive controls required to make drawing and layout type applications. <a href="https://kfarr.github.io/aframe-city-builder">If you have an HTC Vive try it out now!</a> https://kfarr.github.io/aframe-city-builder

## Screenshots
<img src="./images/screenshots.gif" />
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/images/screenshot1.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/images/screenshot2.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/images/screenshot3.png
* https://raw.githubusercontent.com/kfarr/aframe-city-builder/master/images/screenshot4.png

## wishlist
* save/load scenes to/from json file
* add some more fun placeable objects like pixel people and ufo's from <a href="https://github.com/mikelovesrobots/mmmm">mmmm</a> 
* firebase or simple db storage for scenes in json or other format
* pull d3 out of demo-controls.js, rename this component more appropriately, use a proper build process to combine and minify all the various libraries
* clear / delete (bulldozer?)
* adopt a palette or other creative user interface to choose categories of objects, it is tiresome to scroll past many objects
* "lazy loading" of objects only when necessary, right now all available objects are loaded at once
* integrate with http://streetmix.net/ to generate street blocks
* auth / storage service
* highlight currently overlapping grid location
* cars to follow prescribed course on roads
* user generated objects / global object store
* persistent multiuser world
* use geolocation api to with virtual citybuilder locations to create "mini second life"
* physics

## wishlist done
* * - basic desktop info ui
* * - undo
* * - added houses and vehicles from https://github.com/mikelovesrobots/mmmm
* * - cars, bikes, trucks - we got em!
* * - buildings, houses - we got em too!
* * - snap to grid for bases
* * - nicer looking table
* * - display a grid
* * - background selection - dark starry skies, what else?
* * - separate right-hand and left-hand object selection: left-hand for "bases", right-hand for "objects"
* * - add support for switching objects (ie from car to tree, etc.) press trackpad button to see the "preview" change
* * - add object

## model credits:
* most models from https://github.com/mikelovesrobots/mmmm
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
* Most nice looking objects are from the <a href="https://github.com/mikelovesrobots/mmmm">"Mini Mike's Metro Minis" project</a>are under the <a href="https://github.com/mikelovesrobots/mmmm/blob/master/LICENSE">Creative Commons License.</a>
