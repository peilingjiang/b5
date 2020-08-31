import equal from 'react-fast-compare'

const _onBlockCheckList = [
  'blockFill',
  'blockRoom',
  'node',
  'inputBox',
  'sliderComponent',
  'wireHolder',
  'wire',
  'wireBackground',
]
export const hoveringOnBlock = classList => {
  for (let i in _onBlockCheckList)
    if (classList.contains(_onBlockCheckList[i])) return false
  return true
}

const _onWireCheckList = ['wire', 'wireBackground']
export const hoveringOnWire = classList => {
  for (let i in _onWireCheckList)
    if (classList.contains(_onWireCheckList[i])) return true
  return false
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
export const operationalClick = target => {
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

export const helper_getInd = (stateArray, subset) => {
  for (let i in stateArray) if (equal(stateArray[i], subset)) return i
  return -1
}
