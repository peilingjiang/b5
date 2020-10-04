import equal from 'react-fast-compare'

/*
const _onBlockCheckList_Re = [
  'blockFill',
  'blockRoom',
  'node',
  'inputBox',
  'sliderComponent',
  'wireHolder',
  'wire',
  'wireBackground',
  'pickerEntry',
  'entryText',
  'pickerName'
]
*/
const _onBlockCheckList = [
  'blockName',
  'block',
  'left',
  'right',
  'nodeText',
  'sliderBox',
  'rangeBelow',
]
export const hoveringOnBlock = classList => {
  for (let i of _onBlockCheckList) if (classList.contains(i)) return true
  return false
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

export const _addClassNameByClass = (block, targetClass, className) => {
  for (let i of block.current.getElementsByClassName(targetClass)) {
    i.classList.add(className)
  }
}

export const _removeClassNameByClass = (block, targetClass, className) => {
  for (let i of block.current.getElementsByClassName(targetClass)) {
    i.classList.remove(className)
  }
}
