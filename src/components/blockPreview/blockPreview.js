import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import BlockRendererLite from '../blockRenderer/blockRendererLite'
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

    return (
      <div className={'blockHolder ' + type + 'Section'}>
        <BlockRendererLite
          name={name}
          source={source}
          ref={this.blockPreviewRef}
        />
      </div>
    )
  }
}
