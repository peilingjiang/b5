import React, { useRef, useEffect } from 'react'

const iconsImg = {
  Settings: require('../img/toolbar-icon/settings.svg'),
  File: require('../img/toolbar-icon/file.svg'),
  Share: require('../img/toolbar-icon/share.svg'),
  NoLoop: require('../img/toolbar-icon/noLoop.svg'),
  Loop: require('../img/toolbar-icon/loop.svg'),
}

export function drag(...args) {
  // args[0] - Task Name - separator...

  let mouseDown

  if (args[0] === 'separator') {
    const leftElement = args[2]
    const separator = args[1]
    const rightElement = args[3]

    function moveSeparator(e) {
      let deltaX = Math.min(
        Math.max(e.clientX - mouseDown.e.clientX, -mouseDown.leftWidth),
        mouseDown.rightWidth
      )
      // Use % to keep responsibility (when window resized)
      separator.current.style.left =
        ((mouseDown.offsetLeft + deltaX) / window.innerWidth) * 100 + '%'
      leftElement.current.style.width =
        ((mouseDown.leftWidth + deltaX) / window.innerWidth) * 100 + '%'
      rightElement.current.style.width =
        ((mouseDown.rightWidth - deltaX) / window.innerWidth) * 100 + '%'
    }

    separator.current.addEventListener(
      'mousedown',
      e => {
        e.preventDefault()
        mouseDown = {
          e,
          offsetLeft: separator.current.offsetLeft,
          leftWidth: leftElement.current.offsetWidth,
          rightWidth: rightElement.current.offsetWidth,
        }
        document.addEventListener('mousemove', moveSeparator, true)
        document.addEventListener(
          'mouseup',
          function _listener() {
            document.removeEventListener('mousemove', moveSeparator, true)
            document.removeEventListener('mouseup', _listener, true)
          },
          true
        )
      },
      true
    )
  }
}

const Icon = ({ name, onClickFunc }) => {
  return (
    <div className={'toolbarIcon ' + name.toLowerCase()} onClick={onClickFunc}>
      <img src={iconsImg[name]} alt={name} />
    </div>
  )
}

export const IconList = ({ iconsName, onClickFunc }) => {
  let icons = []
  for (let i in iconsName) {
    icons.push(
      <Icon
        key={iconsName[i] + ' toolbarIcon'}
        name={iconsName[i]}
        onClickFunc={onClickFunc[i]}
      />
    )
  }
  return icons
}

export const Emoji = props => {
  /*
  Takes two props:
  emoji="😊"
  label="smile"
  */
  return (
    <span
      className="emoji"
      role="img"
      aria-label={props.label ? props.label : ''}
      aria-hidden={props.label ? 'false' : 'true'}
    >
      {props.emoji}
    </span>
  )
}

export function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export function constrain(v, a, b) {
  const min = Math.min,
    max = Math.max
  return max(min(v, max(a, b)), min(a, b))
}

const operationalClassNames = [
  'node',
  'tab',
  'toolbarIcon',
  'header',
  'addButton',
  'separator',
  'split',
  'sectionResizeBar',
]
export function operationalClick(target) {
  // Return true if the click is operational (dragging, clicking button...)
  let depth = 0
  while (target.parentElement !== null && depth < 2) {
    if (target.classList.length)
      for (let i in operationalClassNames)
        if (target.classList.contains(operationalClassNames[i])) return true
    target = target.parentElement
    depth++
  }
  return false
}
