import { nativeSectionDataToAdd, nativeSectionStyleToAdd } from './defaultValue'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

// * Base Functions
const findName = name => {
  // Take a name and check if it has already in blocks object
  // * Return true if Found name in the object, false if not
  if (
    Object.keys(_b5BlocksObject.custom).includes(name) ||
    Object.keys(_b5BlocksObject.library).includes(name) ||
    Object.keys(_b5BlocksObject.custom).includes(name)
  )
    return true
  return false
}

// * Action Functions

export const addSection = (type, factory, factoryStyle) => {
  // Add to editor data
  const toAdd = JSON.parse(nativeSectionDataToAdd), // Data
    toAddStyle = JSON.parse(nativeSectionStyleToAdd) // Style

  let nameInd = -1 // Index starts from 0
  let newName = ''
  do {
    newName = `new${type.slice(0, 3) + ++nameInd}`
  } while (findName(newName))
  toAdd.name = newName
  toAdd.type = type

  factory[type].push(toAdd)
  factoryStyle[type].push(toAddStyle)
}

export const deleteSection = (
  t,
  i,
  factoryCanvasRef,
  factory,
  factoryStyle
) => {
  let name = factory[t][i].name

  delete factory[t][i]
  delete factoryStyle[t][i]
  delete factoryCanvasRef[t][i]
  factory[t].splice(i, 1)
  factoryStyle[t].splice(i, 1)
  factoryCanvasRef[t].splice(i, 1)

  _b5BlocksObject.deleteCustom(name)
}

export const renameSection = (type, index, newName, factory) => {
  factory[type][index].name = newName
}
