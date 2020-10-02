import _b5BlocksObject from '../b5.js/src/blocks/blocksObjectWrapper'

const _isFunction = functionToCheck => {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
  )
}

export const makeBlock = (name, source = null) => {
  if (!source)
    for (let i in _b5BlocksObject)
      if (_b5BlocksObject[i].hasOwnProperty(name)) source = i
  if (!source) return false

  const block = _b5BlocksObject[source][name]

  const sudoData = {
    name: name,
    source: source,
  }

  if (block.inputNodes) {
    sudoData.input = {}
    for (let i in block.inputNodes) sudoData.input[i] = null
  }

  if (block.inlineData) {
    sudoData.inlineData = []
    let bD = _isFunction(block.default) ? block.default() : block.default
    for (let i in block.inlineData) sudoData.inlineData.push(bD[i])
  }

  if (block.outputNodes) {
    sudoData.output = {}
    for (let i in block.outputNodes) sudoData.output[i] = []
  }

  return sudoData
}
