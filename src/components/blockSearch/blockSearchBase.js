import Fuse from 'fuse.js'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

const options = {
  keys: [
    {
      name: 'name',
      weight: 0.7,
    },
    {
      name: 'block.description',
      weight: 0.2,
    },
    {
      name: 'block.type',
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
    if (typeof obj[key] === 'object')
      result.push({
        name: key,
        source: src,
        block: obj[key],
      })
    return result
  }, [])
}

const _b5Search = new _b5Fuse(_b5BlocksObject, options)

export default _b5Search
