# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## 0.1.1 - [UNRELEASED]
### Work in progress
* add new objects (valencia street pack)
* Removed and then re-added reference to webpack built dist in index.html
* made a few youtube videos of city builder and UI: https://www.youtube.com/watch?v=ni_AF6RYtZo
* "first ui" blog post about city builder aframe select bar: https://medium.com/p/38b0c86ed7b7/
* removed select-bar component from this project and added reference to new repo: https://github.com/kfarr/aframe-select-bar-component
* added guide in readme re how to contribute new objects to repo
* moved "trigger" event to select bar component
* convert from bmfont to new aframe text component
* added 2nd controller element with action menu commands
* added teleport
* added save to firebase
* aframe.city domain registration and firebase hosting
* add new game title, city name and favicon, yay 🏗️ aframe.city!

O activate (add component) only when menu item selected
  - double check removal of teleport
O test inverted teleport from forked repo
- separate save component on scene (or city element)
- test firebase save component
- change url hash to camel case city name (no hyphen)
- test open from firebase URL
- save message with city name
- save as new city name - put on bg near logo?
- test new camera view
- remove old save / load buttons from UI
- add city name hash to page title when saved / opened / saveAs'ed
- add aframe.city to chrome/daydream vr whitelist

LATER THINGS:
- new city
- erase tool
- inspect (magnifying glass)
- auto save with visual indicator (custom firebase that works)

- get people to use the things
  - city builder as a multi platform app
  - top 10:
    - size of city (objects, area)
    - population (number of chr objects)
    - visitors (is this a self fulfilling prophecy?)
    - recently saved

## 0.1.0 - 2017-01-29
### Added
- Added many more objects! vehicles, aliens, buildings, and pre-fab scenes!
- New support for switching through different object group types!
- Added webpack and basic build process (minification not working)

### Changed
- Select menu is now separate component apart from city builder logic
  - select menu accepts an array of possible items, images, metadata
  - menu responds to emitted events independent of controllers
  - menu has optional built-in bindings to controllers. those bindings simply emit menu events.
  - this will be released as a separate repo with add'l documentation
- City builder controls logic now loads objects from json files into the dom for the select bar component
- Right controller and object hidden for now, needs add'l work to support two controllers with new menu bar component
- Copied more remote items to repo such as text textures, ground mesh

## 0.0.9 - 2017-01-14
### Added
- mvp of new object menu interface
- support forward/back object switching with vive and oculus
- use 85% axis level to trigger object scroll forward/back when using the oculus touch thumbstick
- use preview images for next/previous objects
- added some fun placeable objects like UFOs from https://github.com/mikelovesrobots/mmmm
- created 2 utilities for creating object group json index and preview images (/utils)
- added all original vox files from mmmm (/assets/vox)

### Changed
- This version only allows for placement of base plates and alien voxel objects. More placeable objects will be supported shortly.
- New grouping prefix "bld" for building objects (renamed those objects from "obj" prefix)

## 0.0.8 - 2017-01-03
### Added
- added support for loading object lists from json files instead of hardcoding in app
- removed d3 dependencies
- refactored object loading code
- new json_builder.js utility to create city builder compatible object lists in json format
- add all vehicle (veh) objects from mmmm

### Changed
- changed directory structure, most things are now under assets

## [Unversioned Releases] - 2017-01-01 and prior
### Added
- Added a changelog.
- Prior to the change log, all these things were added or changed:
- support both oculus touch and vive using https://github.com/chenzlabs/a-painter/blob/5aeaf2bd592a49be5e523474e2c43cc1e225ae7f/src/components/auto-detect-controllers.js
- pull d3 out of demo-controls.js, rename this component more appropriately,
- make the game title look nicer - restore the geometric text from ada
- add an option to load a default example city
- add ability to load from json file
- show a nicer default camera view / rotation
- improve the overlay dialogue "close" button styling
- paste in json should autoselect
- upgrade to aframe 0.4.0
- (basic) save/load scenes to/from json file
- basic desktop info ui
- undo
- added houses and vehicles from https://github.com/mikelovesrobots/mmmm
- cars, bikes, trucks - we got em!
- buildings, houses - we got em too!
- snap to grid for bases
- nicer looking table
- display a grid
- background selection - dark starry skies, what else?
- separate right-hand and left-hand object selection: left-hand for "bases", right-hand for "objects"
- add support for switching objects (ie from car to tree, etc.) press trackpad button to see the "preview" change
- add object
