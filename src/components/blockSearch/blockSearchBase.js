import Fuse from 'fuse.js'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

const options = {
  keys: [
    {
      name: 'name',
      weight: 0.3,
    },
    {
      name: 'description',
      weight: 0.2,
    },
    {
      name: 'text',
      weight: 0.4,
    },
    {
      name: 'type',
      weight: 0.1,
    },
  ],
  threshold: 0.4,
}

class _b5Fuse {
  constructor(b5Blocks, options) {
    this.b5Blocks = b5Blocks
    this.fuse = new Fuse([], options)

    this.originalBase = this._constructArray(this.b5Blocks.original, 'original')
    this.base = []
  }
}

_b5Fuse.prototype.update = function () {
  // Reconstruct Fuse search database
  delete this.base
  this.base = []
  this.base.push(...this.originalBase)
  this.base.push(...this._constructArray(this.b5Blocks.custom, 'custom'))
  this.base.push(...this._constructArray(this.b5Blocks.library, 'library'))
  this.fuse.setCollection(this.base)
}

_b5Fuse.prototype.search = function (value) {
  return this.fuse.search(value)
}

_b5Fuse.prototype._constructArray = function (obj, src) {
  return Object.keys(obj).reduce((result, key) => {
    if (typeof obj[key] === 'object' && key !== 'library')
      result.push({
        name: key,
        source: src,
        description: obj[key].description,
        text: obj[key].text,
        type: obj[key].type,
      })
    return result
  }, [])
}

const _b5Search = new _b5Fuse(_b5BlocksObject, options)

export default _b5Search
