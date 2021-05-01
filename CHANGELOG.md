# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add "+" and "beta" tags after the version number for each build of the online editor.
- Several new blocks, including logical AND and OR, `round`, `mouseClicked`, `backgroundPicker`, etc.
- Add physical engine library blocks based on [matter.js](https://brm.io/matter-js/), including `engine`, `ground`, `box`, `ball`, etc.
- A new optional field for blocks: `filter`. An array of filters that determine whether a block can be added to the codeCanvas, e.g., `setup` filter constrains the block to be added only inside the `variable` section, `unique` filter limits the number of the block across the whole project to one. Example blocks using the field are `createCanvas` and `matter_startEngine`.

### Changed

- New domain: https://b5editor.app.
- Change "add" to "new" for the button to define customized variables, function, etc.
- Long block description in block search window is truncated.

### Fixed

- Can't add customized block to code canvas due to the new hint system.
- Can't set or get framerate.
- Can't blur input elements like the ones in comment or slider blocks.
- Saved files don't have the version number.

## [0.2.1] - 2021-03-27

### Changed

- Dragging dot follows the cursor precisely when adding wires.
- Update slider styles.

### Fixed

- Fixed `uuid` of introduction editor setup.

## [0.2.0] - 2021-03-27

### Added

- New blocks including transformation, fraction slider, etc.
- Upgrade to React v17.0.

### Changed

- Fix canvas zoom in/out (vertical scroll) with the trackpad.
- Performance optimization: codeCanvas.
- A much lighter and faster way to parse hints for components.
- Migrate from p5 to [q5](https://github.com/peilingjiang-DEV/q5xjs) for better performance.
- Move (pan) around the canvas by all three keys (left, middle, right) of the mouse, instead of only the right one.
- New look of the sliders.

### Fixed

- Code canvas stops reading actions after adding a new block.
- Errors in the following blocks: `rotate`.
- Canvas `wheel` event can't prevent default.
- "Add block" hint doesn't appear when no block is in the canvas.

## [0.1.2] - 2020-12-23

Hello world! The first release for demo and prototyping purposes.

[unreleased]: https://github.com/peilingjiang/b5/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/peilingjiang/b5/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/peilingjiang/b5/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/peilingjiang/b5/releases/tag/v0.1.2
