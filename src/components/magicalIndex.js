// Library of special effect blocks

/* --------------------------- Color Effect Blocks -------------------------- */

/**
 * TYPES
 * 0: All after
 * 1: All before
 * 2: Surroundings
 * 3: One line
 * 4: One column
 */

export const _colorEffectIndex = {
  fillPicker: 0,
  strokePicker: 0,
  fillRGBA: 0,
  strokeRGBA: 0,
  noFill: 0,
  noStroke: 0,

  stopDraw: 0,
  startDraw: 0,

  strokeWeight: 0,
  strokeWeightSlider: 0,

  translate: 0,
  rotate: 0,

  quadratic: 2,
}

export const _colorEffectNames = [
  'fill',
  'stroke',
  'strokeWeight',
  'stopBeginDraw',
]

/* -------------------------- Scale Sensitive Block ------------------------- */

export const _scaleSensitiveBlockKinds = ['slider', 'colorPicker']
