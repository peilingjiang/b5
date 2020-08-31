import { lineHeight, roomWidth } from '../constants'

export const getYX = (target, canvas) => {
  // Get the Y and X index of a blockRoom in its codeCanvas
  return [
    (target.offsetTop - canvas.offsetTop) / lineHeight,
    (target.offsetLeft - canvas.offsetLeft) / roomWidth,
  ]
}
