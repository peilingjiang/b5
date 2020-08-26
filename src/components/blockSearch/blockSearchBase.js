import Fuse from 'fuse.js'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

const options = {
  keys: ['kind'],
}

const _b5Fuse = new Fuse(_b5BlocksObject, options)

export default _b5Fuse
