# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.0.8 - [Unreleased / Date TBD]
### Added
- * parity animate snapping to bases
- * parity item switch both sides
- * remove d3
- * parity save / load items - fix it - O- backward compatible with json or fix it
- * new json_builder.js utility to create city builder compatible object lists in json format
- * new feature add veh objects from mmmm - all of them. obj only, no img preview
- * parity add scene bases temporarily back to bases file
- TEST new load / save in their own file
- TEST against vive
- FEATURE PARITY - test and release --

- load new scenes without destroying original (load by appending) - does not handle collision case
- copy ada pictures to local project, ground mesh as well
- item switching left / right with watch ui concept
- object type switching up / down

### Changed
- changed directory structure, most things are now under assets/

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
