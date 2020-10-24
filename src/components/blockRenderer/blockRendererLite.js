import React, { useRef, forwardRef } from 'react'

import BlockRenderer from './blockRenderer'
import { makeBlock } from '../make'

const BlockRendererLiteRef = ({
  name,
  source,
  focus,
  isRenaming,
  thisBlockRef,
}) => {
  const thisRef = useRef()

  return (
    <BlockRenderer
      action={false}
      thisBlockRef={thisBlockRef.block || thisRef}
      thisNameRef={thisBlockRef.name || undefined}
      isRenaming={isRenaming}
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
