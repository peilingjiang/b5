import equal from 'react-fast-compare'
import { lineHeight, roomWidth } from '../constants'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

export const getYX = (target, canvas) => {
  // Get the Y and X index of a blockRoom in its codeCanvas
  return [
    (target.offsetTop - canvas.offsetTop) / lineHeight,
    (target.offsetLeft - canvas.offsetLeft) / roomWidth,
  ]
}

export const hasGreaterEqualPosition = (aY, aX, bY, bX) => {
  // Return true if a has greater or equal position than b does
  // a and b are both arrays - [y, x]
  return aY > bY ? true : aY < bY ? false : aX >= bX ? true : false
}

export const isColorActivated = (allActive, c) => {
  for (let i of allActive) if (equal(i, c.slice(0, 2))) return true
  return false
}

export const getEffectName = name => {
  return _b5BlocksObject[name].colorEffectName
}

const _scrollComponentClassName = ['writingArea']
export const scrollOnComponent = classList => {
  for (let i of _scrollComponentClassName)
    if (classList.contains(i)) return true
  return false
}
