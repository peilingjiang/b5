import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import BlockRendererLite from '../blockRenderer/blockRendererLite'
import '../../postcss/components/blockPreview/blockPreview.css'

export default class BlockPreview extends Component {
  constructor(props) {
    super()
    this.blockPreviewRef = createRef()
  }

  // componentDidMount() {
  //   let thisPreviewBlock = this.blockPreviewRef.current.getElementsByClassName('block')[0]
  // }

  shouldComponentUpdate(nextProps) {
    return (
      !equal(nextProps.data.blocks, this.props.data.blocks) ||
      nextProps.name !== this.props.name ||
      nextProps.isRenaming !== this.props.isRenaming
    )
  }

  render() {
    const {
      data: { name },
      source,
      blockNameRef,
      isRenaming,
    } = this.props

    const ref = {
      block: this.blockPreviewRef,
      name: blockNameRef,
    }

    return (
      <div className="blockHolder">
        <BlockRendererLite
          name={name}
          blockNameRef={blockNameRef}
          isRenaming={isRenaming}
          source={source}
          ref={ref}
          draggable={true}
        />
      </div>
    )
  }
}
