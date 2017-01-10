# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.0.9 - [UNRELEASED]
### IN PROGRESS
http://callumprentice.github.io/apps/double_pendulum/index.html
send a postcard
- support forward/back object switching
- add some more fun placeable objects like pixel people and ufo's from https://github.com/mikelovesrobots/mmmm
  - create new definition file for chr and bld
^
- use preview images for next/previous objects
- support scroll right/left of objects via touch thumbstick/vive touchpad

^
- object type switching up / down

~
- teleport https://chenzlabs.github.io/aframe-teleport-controls/sample/
- scale large/small (and rotate?) with both grips being pressed
- copy ada pictures to local project, ground mesh as well
- add a small haptic feedback see: https://github.com/imgntn/jBow/blob/ab2d254f288c563f33e6ed745e41a72ee2b7f759/components/bow-and-arrow.js#L163

v- aframe city website - have a central registry of objects (json file is fine to start) that is not in index.html file ui inspiration - https://buffy.run/model/578e438962c6c80000ea4c5e -> this could be done without a server -> use a git based site builder service. register this as aframe.city
v- try progressive enhancement to replace obj with baked ply after loading
v- load new scenes without destroying original (load by appending) - does not handle collision case

### Changed
- added original vox files from mmmm
- created new grouping prefix "bld" for building objects (renamed those objects from "obj" prefix)
- tried https://github.com/takahirox/aframe-outline component, not great and slows down scene, might be okay as user selectable option in future


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
