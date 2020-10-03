import equal from 'react-fast-compare'
import { lineHeight, roomWidth } from '../constants'

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
