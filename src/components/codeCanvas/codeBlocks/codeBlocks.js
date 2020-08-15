import React, { Component, createRef } from 'react'

import BlockRenderer from '../../../b5.js/blockRenderer/blockRenderer'
import '../../../postcss/components/codeCanvas/codeBlocks/codeBlocks.css'

export default class CodeBlocks extends Component {
  constructor(props) {
    super(props)

    // Create Refs for each block
    const { data } = props
    this.blocks = {}
    for (let i in data) {
      if (!this.blocks[i]) this.blocks[i] = {}
      for (let j in data[i]) this.blocks[i][j] = createRef()
    }

    this.codeBlocks = createRef()
  }

  shouldComponentUpdate(prevProps) {
    return prevProps.data !== this.props.data
  }

  render() {
    const { data } = this.props
    let blocks = []
    for (let i in data)
      for (let j in data[i])
        blocks.push(
          <BlockRenderer
            key={'block ' + i + ' ' + j}
            ref={this.blocks[i][j]}
            data={data[i][j]}
            y={i}
            x={j}
          />
        )
    return (
      <div ref={this.codeBlocks} className="codeBlocks">
        {blocks}
      </div>
    )
  }
}
