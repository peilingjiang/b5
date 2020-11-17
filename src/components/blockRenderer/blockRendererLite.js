import React, { useRef, forwardRef } from 'react'

import BlockRenderer from './blockRenderer'
import { makeBlock } from '../../b5.js/src/core/make'

const _selectedNodes = {
  input: [],
  output: [],
}

// Render a sudo block
const BlockRendererLiteRef = ({
  name,
  source,
  focus,
  isRenaming,
  thisBlockRef,
  draggable,
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
      selectedNodes={_selectedNodes}
      draggable={draggable}
      liteRenderer={true} // Always re-render for lite renderers
    />
  )
}

const BlockRendererLite = forwardRef((props, ref) => (
  <BlockRendererLiteRef thisBlockRef={ref} {...props} />
))

export default BlockRendererLite
