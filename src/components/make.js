import _b5BlocksObject from '../b5.js/src/blocks/blocksObjectWrapper'

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
    for (let i in block.inlineData) sudoData.inlineData.push(block.default[i])
  }
  if (block.outputNodes) {
    sudoData.output = {}
    for (let i in block.outputNodes) sudoData.output[i] = []
  }

  return sudoData
}
