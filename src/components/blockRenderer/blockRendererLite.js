import React, { memo, useRef, forwardRef } from 'react'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'
import BlockRenderer from './blockRenderer'

const BlockRendererLiteRef = ({ name, source, thisBlockRef }) => {
  const thisRef = useRef()

  const block = _b5BlocksObject[source][name]

  const sudoData = {
    name: name,
    source: source,
  }
  if (block.inputNodes) {
    const tempInput = {}
    for (let i in block.inputNodes) tempInput[i] = null
    sudoData.input = tempInput
  }
  if (block.inlineData) {
    let tempInlineData = []
    for (let i in block.inlineData) tempInlineData.push(block.default[i])
    sudoData.inlineData = tempInlineData
  }
  if (block.outputNodes) {
    const tempOutput = {}
    for (let i in block.outputNodes) tempOutput[i] = []
    sudoData.output = tempOutput
  }

  return (
    <BlockRenderer
      action={false}
      thisBlockRef={thisBlockRef || thisRef}
      data={sudoData}
      inputBlocks={null}
      focused={false}
      selectedNodes={{
        input: [],
        output: [],
      }}
    />
  )
}

const BlockRendererLite = memo(
  forwardRef((props, ref) => (
    <BlockRendererLiteRef thisBlockRef={ref} {...props} />
  ))
)

export default BlockRendererLite
