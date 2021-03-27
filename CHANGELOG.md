# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/peilingjiang/b5/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/peilingjiang/b5/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/peilingjiang/b5/releases/tag/v0.1.2
