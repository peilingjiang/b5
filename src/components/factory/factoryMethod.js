import { lineHeight, longestBlockName, roomWidth } from '../constants.js'
import _b from '../editor/b5ObjectWrapper.js'

export const checkSectionNameNotValid = (name, propsName) => {
  // Return true if the name is not valid
  return (
    !/^[0-9A-Z]+$/i.test(name.replace(/\s+/g, '')) ||
    name.length <= 0 ||
    name.length > longestBlockName ||
    (name !== propsName && _b.unavailableNames.includes(name))
  )
}

/* ------------------ Drag block from factory to playground ----------------- */

const checkAddAnonymousBlock = (newElement, scale, collect) => {
  const nEBounding = newElement.getBoundingClientRect()
  // Example hints - 'cnv block'
  const blockName = newElement
    .getElementsByClassName('block')[0]
    .dataset.hints.split(' ')[0]

  const mid = {
    x: nEBounding.left + nEBounding.width * 0.5,
    y: nEBounding.top + nEBounding.height * 0.5,
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
      b.x + roomWidth * scale > mid.x &&
      b.y <= mid.y &&
      b.y + lineHeight * scale > mid.y
    ) {
      // ! Add to the playground codeCanvas!
      collect([blockName, r.dataset.y, r.dataset.x], 'addBlock', 'playground')
      break
    }
  }
}

const handleDragAnonymousBlock = (mousedown, newElement, e) => {
  newElement.style.top =
    mousedown.top + e.clientY - mousedown.y + mousedown.offsetY + 'px' // top + delta
  newElement.style.left =
    mousedown.left + e.clientX - mousedown.x + mousedown.offsetX + 'px'
}

export const handleMoveAnonymousBlock = (element, mousedownEvent, collect) => {
  const parent = element.parentNode // blockFill element
  const newElement = parent.cloneNode(true)
  const pBounding = parent.getBoundingClientRect()
  const eBounding = element.getBoundingClientRect()

  const playgroundCanvas = document.getElementById('playgroundCodeCanvas')
  const scale =
    Math.round(
      (playgroundCanvas.getBoundingClientRect().width /
        playgroundCanvas.offsetWidth) *
        1000
    ) * 0.001

  const offsetX =
    (mousedownEvent.clientX - eBounding.left - (eBounding.width >> 1)) *
    (1 - scale)
  const offsetY =
    (mousedownEvent.clientY - eBounding.top - (eBounding.height >> 1)) *
    (1 - scale)

  newElement.style.top = pBounding.top + offsetY + 'px'
  newElement.style.left = pBounding.left + offsetX + 'px'
  newElement.style.zIndex = 9999995 // z-index

  newElement.style.transform = `scale(${scale})`

  newElement.classList.add('focused')
  newElement.classList.add('node-disabled')
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
      offsetX: offsetX,
      offsetY: offsetY,
    },
    newElement
  )
  document.addEventListener('mousemove', hDAB)
  document.addEventListener('mouseup', function _listener() {
    checkAddAnonymousBlock(newElement, scale, collect)
    element.classList.remove('opaque')

    document.removeEventListener('mousemove', hDAB)
    document.removeEventListener('mouseup', _listener)
  })
}

/* -------------------------------------------------------------------------- */
