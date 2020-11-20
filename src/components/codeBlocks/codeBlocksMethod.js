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
]
export const hoveringOnBlock = classList => {
  for (let i of _onBlockCheckList) if (classList.contains(i)) return true
  return false
}

const _onWireCheckList = ['wire', 'wireBackground']
export const hoveringOnWire = classList => {
  for (let i of _onWireCheckList) if (classList.contains(i)) return true
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
      for (let i of operationalClassNames)
        if (target.classList.contains(i)) return true
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
  if (block.current !== null) {
    for (let i of block.current.getElementsByClassName(targetClass)) {
      i.classList.remove(className)
    }
  }
}

/* -------------------------------------------------------------------------- */

export const blockKeyBuilder = (data, i, j) => {
  return data.uuid ? data.uuid + i + ' ' + j : `${i} ${j} ${data.name}`
}
