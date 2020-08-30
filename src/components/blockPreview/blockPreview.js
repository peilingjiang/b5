import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'
import BlockRenderer from '../blockRenderer/blockRenderer'
import '../../postcss/components/blockPreview/blockPreview.css'

export default class BlockPreview extends Component {
  constructor(props) {
    super(props)
    this.blockPreviewRef = createRef()
  }

  shouldComponentUpdate(nextProps) {
    return (
      !equal(nextProps.data.blocks, this.props.data.blocks) ||
      nextProps.name !== this.props.name
    )
  }

  render() {
    const {
      data: { name },
      type,
      source,
    } = this.props

    const tempInput = {},
      tempOutput = {}
    for (let i in _b5BlocksObject[source][name].inputNodes) tempInput[i] = null
    for (let i in _b5BlocksObject[source][name].outputNodes) tempOutput[i] = []

    const sudoData = {
      name: name,
      source: source,
      input: tempInput,
      // inlineData: null,
      output: tempOutput,
    }

    return (
      <div className={'blockHolder ' + type + 'Section'}>
        <BlockRenderer
          action={false}
          thisBlockRef={this.blockPreviewRef}
          data={sudoData}
          inputBlocks={null}
          focused={false}
          selectedNodes={{
            input: [],
            output: [],
          }}
        />
      </div>
    )
  }
}
