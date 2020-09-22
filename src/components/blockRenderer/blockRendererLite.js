import React, { useRef, forwardRef } from 'react'

import BlockRenderer from './blockRenderer'
import { makeBlock } from '../make'

const BlockRendererLiteRef = ({ name, source, focus, thisBlockRef }) => {
  const thisRef = useRef()

  return (
    <BlockRenderer
      action={false}
      thisBlockRef={thisBlockRef || thisRef}
      data={makeBlock(name, source)}
      inputBlocks={null}
      focused={focus || false}
      selectedNodes={{
        input: [],
        output: [],
      }}
    />
  )
}

const BlockRendererLite = forwardRef((props, ref) => (
  <BlockRendererLiteRef thisBlockRef={ref} {...props} />
))

export default BlockRendererLite
