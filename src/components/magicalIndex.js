// Library of special effect blocks

/* --------------------------- Color Effect Blocks -------------------------- */

/**
 * TYPES
 * 0: All Canvas
 * 1: All After
 * 2: All Before
 * 3: Inline
 * 4: Column
 * 5: Around
 */

export const _colorEffectIndex = {
  // 0
  frameRate: 0,

  // 1
  fillPicker: 1,
  strokePicker: 1,
  fillRGBA: 1,
  strokeRGBA: 1,
  noFill: 1,
  noStroke: 1,

  stopDraw: 1,
  startDraw: 1,

  strokeWeight: 1,
  strokeWeightSlider: 1,

  translate: 1,
  rotate: 1,

  // 2
  hideBefore: 2,

  // 3
  disableRow: 3,

  // 4
  disableColumn: 4,

  // 5
  quadratic: 5,
}

export const _colorEffectNames = [
  'fill',
  'stroke',
  'strokeWeight',
  'stopBeginDraw',
]

/* -------------------------- Scale Sensitive Block ------------------------- */

export const _scaleSensitiveBlockKinds = ['slider', 'colorPicker']
