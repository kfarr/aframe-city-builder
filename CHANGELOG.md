# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.0.9 - [UNRELEASED]
### REMAINING BEFORE RELEASE
- fix loading of new base names from json - is there a mismatch?

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
