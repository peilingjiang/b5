import isAlphanumeric from 'validator/lib/isAlphanumeric'

import { lineHeight, roomWidth } from '../constants'
import _b from '../editor/b5ObjectWrapper'

export const checkSectionNameNotValid = (name, propsName) => {
  // Return true if the name is not valid
  return (
    !isAlphanumeric(name) ||
    name.length <= 0 ||
    (name !== propsName && _b.unavailableNames.includes(name))
  )
}

const checkAddAnonymousBlock = (newElement, collect) => {
  const nEBounding = newElement.getBoundingClientRect()
  const blockName = newElement.getElementsByClassName('block')[0].dataset.name

  const mid = {
    x: nEBounding.x + (nEBounding.width >> 1),
    y: nEBounding.y + (nEBounding.height >> 1),
  }

  newElement.remove()

  const playground = document.getElementById('playground')
  playground.classList.remove('dim-others-all')

  const pBounding = playground.getBoundingClientRect()
  if (
    mid.x < pBounding.x ||
    mid.x > pBounding.x + pBounding.width ||
    mid.y < pBounding.y ||
    mid.y > pBounding.y + pBounding.height
  )
    return

  for (let r of playground.getElementsByClassName('blockRoom')) {
    let b = r.getBoundingClientRect()
    if (
      b.x <= mid.x &&
      b.x + roomWidth > mid.x &&
      b.y <= mid.y &&
      b.y + lineHeight > mid.y
    ) {
      collect([blockName, r.dataset.y, r.dataset.x], 'addBlock', 'playground')
      break
    }
  }
}

const handleDragAnonymousBlock = (mousedown, newElement, e) => {
  newElement.style.top = mousedown.top + e.clientY - mousedown.y + 'px'
  newElement.style.left = mousedown.left + e.clientX - mousedown.x + 'px'
}

export const handleMoveAnonymousBlock = (element, mousedownEvent, collect) => {
  const parent = element.parentNode
  const newElement = parent.cloneNode(true)
  const pBounding = parent.getBoundingClientRect()

  newElement.style.top = pBounding.top + 'px'
  newElement.style.left = pBounding.left + 'px'
  newElement.style.zIndex = 9999995 // z-index

  newElement.classList.add('focused')
  newElement
    .getElementsByClassName('block')[0]
    .classList.replace('grab', 'grabbing')

  document.getElementById('playground').classList.add('dim-others-all')
  document.getElementsByTagName('body')[0].appendChild(newElement)

  element.classList.add('opaque')

  const hDAB = handleDragAnonymousBlock.bind(
    this,
    {
      top: pBounding.top,
      left: pBounding.left,
      x: mousedownEvent.clientX,
      y: mousedownEvent.clientY,
    },
    newElement
  )
  document.addEventListener('mousemove', hDAB)
  document.addEventListener('mouseup', function _listener() {
    checkAddAnonymousBlock(newElement, collect)
    element.classList.remove('opaque')

    document.removeEventListener('mousemove', hDAB)
    document.removeEventListener('mouseup', _listener)
  })
}
