# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## 0.1.1 - [UNRELEASED]
### Work in progress
* - add new objects (valencia street pack)
* - Removed reference to webpack built dist in index.html
* - youtube video of city builder
* - "first ui" blog post about city builder aframe select bar
* - convert from bmfont to new text component
*  - try it out
* - allow multiple select-bar elements on same scene
*    - issue: 2nd menu bar stops working after first trackpad press
X  - fix to use proper multiple component syntax
*  - test multiple select bar in VR
*  - add exit
*    - move "trigger" event to select bar component
*    - game logic should be refined to listen for this
*    - test and make sure works
*  - separate select-bar component into new repo
*    - fix separate select-bar
*    - remove from this project and make this project reference the remote repo version

* what is missing from being able to "escape" in city builder? teleport, reliable save

*  - 2nd controller with menu commands
*    - teleport
*      - test inverted teleport from forked repo
*        - forked repo should work - use ghetto version
-
O     - activate (add component) only when menu item selected
*        - action-controls
*          - init - what is the action?
O            - if teleport, add teleport component
O              - remove when not selected
            - if save, add save component?
        - problem - upon init the thing isn't working
      - issue - select bar ID in console log undefined, but code appears correct - is console returning an old definition?

      - bonus prize add animation to currently select action frame to indicate happening
    - save
      - message re URL and city name
      - auto save with visual indicator (custom firebase that works)
    - save as
    - new city
    - erase tool
    - inspect (magnifying glass)

- get people to use the things
  - city builder as a multi platform app
  - top 10:
    - size of city (objects, area)
    - visitors (is this a self fulfilling prophecy?)
    - recently saved
    -
- select menu as separate component
  - documentation
  - work with more than 1 controller

- avatars later



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
