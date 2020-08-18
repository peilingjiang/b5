import React, { Component, createRef } from 'react'

import BlockRenderer from '../../../b5.js/blockRenderer/blockRenderer'
import { roomWidth, lineHeight } from '../../constants'

export default class CodeBlocks extends Component {
  constructor(props) {
    super(props) // data, canvas, collect, scale (for moving)

    /*
    
    > props.collect
    {
      relocate: relocate (function),
      ...
    }
    
    */

    // Create Refs for each block
    const { data } = props
    this.blocksRef = {}
    for (let i in data) {
      if (!this.blocksRef[i]) this.blocksRef[i] = {}
      for (let j in data[i]) this.blocksRef[i][j] = createRef()
    }

    this.codeBlocks = createRef()
  }

  componentDidMount() {
    this.codeBlocks.current.addEventListener(
      'mousedown',
      this.handleMouseDown,
      true
    )
  }

  componentWillUnmount() {
    this.codeBlocks.current.removeEventListener(
      'mousedown',
      this.handleMouseDown,
      true
    )
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.data !== this.props.data
  }

  handleMouseDown = e => {
    // e.preventDefault()
    const that = this
    if (!e.target.classList.contains('blockFill') && e.which !== 3) {
      if (!e.target.classList.contains('node')) {
        // BLOCK
        const thisBlockInd = this._findBlock(e.target)
        const thisBlock = this.blocksRef[thisBlockInd[0]][thisBlockInd[1]]
        if (thisBlock) {
          // thisBlock.current.focus()
          thisBlock.current.childNodes[0].className = thisBlock.current.childNodes[0].className.replace(
            'grab',
            'grabbing'
          )
          let mouse = {
            x: e.clientX,
            y: e.clientY,
            blockLeft: thisBlock.current.offsetLeft,
            blockTop: thisBlock.current.offsetTop,
          }

          const handleMove = this.handleMoveBlock.bind(this, {
            m: mouse,
            b: thisBlock.current,
          })
          const codeBlocksCurrent = this.codeBlocks.current
          codeBlocksCurrent.addEventListener('mousemove', handleMove, true)
          document.addEventListener(
            'mouseup',
            function _listener() {
              codeBlocksCurrent.removeEventListener(
                'mousemove',
                handleMove,
                true
              )
              thisBlock.current.childNodes[0].className = thisBlock.current.childNodes[0].className.replace(
                'grabbing',
                'grab'
              )
              that._checkMove(mouse, thisBlock, thisBlockInd)
              document.removeEventListener('mouseup', _listener, true)
            },
            true
          )
        }
      } else if (e.target.classList.contains('node')) {
        // NODE
      }
    }
  }

  handleMoveBlock = (props, e) => {
    const { m, b } = props // mouse, thisBlock.current
    const {
      canvas: { lineCount, blockCount },
    } = this.props
    let delta = {
      x: e.clientX - m.x,
      y: e.clientY - m.y,
    }

    b.style.left =
      Math.max(
        Math.min(
          m.blockLeft + delta.x / this.props.scale,
          (blockCount - 1) * roomWidth
        ),
        0
      ) + 'px'
    b.style.top =
      Math.max(
        Math.min(
          m.blockTop + delta.y / this.props.scale,
          (lineCount - 1) * lineHeight
        ),
        0
      ) + 'px'
  }

  _hasParentOrChildInTheSameLine(bD, y) {
    if (bD.input)
      for (let i in bD.input)
        if (bD.input[i] !== null && bD.input[i][0] === y) return true
    if (bD.output)
      for (let i in bD.output)
        if (bD.output[i] !== null && bD.output[i][0] === y) return true

    return false
  }

  _checkMove(m, b, bInd) {
    // mouse, thisBlock
    const blockCurrent = b.current
    const blockData = this.props.data[bInd[0]][bInd[1]]
    const { offsetLeft, offsetTop } = blockCurrent
    const x = Math.round(offsetLeft / roomWidth),
      y = Math.round(offsetTop / lineHeight)

    if (
      (this.props.data[y] && this.props.data[y][x]) ||
      this._hasParentOrChildInTheSameLine(blockData, y)
    ) {
      // Already occupied
      blockCurrent.style.left = m.blockLeft + 'px'
      blockCurrent.style.top = m.blockTop + 'px'
    } else {
      // Successfully moved!
      blockCurrent.style.left = x * roomWidth + 'px'
      blockCurrent.style.top = y * lineHeight + 'px'

      // Handle ref
      // Create new
      if (!this.blocksRef[y]) this.blocksRef[y] = {}
      this.blocksRef[y][x] = createRef()
      // Remove old
      delete this.blocksRef[bInd[0]][bInd[1]]
      if (this.blocksRef[bInd[0]] === {}) delete this.blocksRef[bInd[0]]

      this.props.collect.relocate(bInd[1], bInd[0], x, y)
    }
  }

  _findBlock(target) {
    // Find the blockFill target
    let depth = 0
    while (!target.classList.contains('blockFill') && depth < 4) {
      target = target.parentElement
      depth++ // Avoid infinite search
    }
    if (!target.classList.contains('blockFill')) return false
    // Get the right ref
    for (let i in this.blocksRef)
      for (let j in this.blocksRef[i]) {
        if (
          this.blocksRef[i][j].current.offsetLeft === target.offsetLeft &&
          this.blocksRef[i][j].current.offsetTop === target.offsetTop
        )
          // return this.blocksRef[i][j]
          return [i, j] // [y, x]
      }
    return false
  }

  _getInputNodes(input) {
    // input - array of arrays of 3
    // [Row Ind, Column Ind, Node Ind]
    let inputBlocks = {}
    for (let i in input)
      inputBlocks[i] =
        input[i] !== null
          ? this.props.data[input[i][0]][input[i][1]].name
          : null
    return inputBlocks
  }

  render() {
    const { data } = this.props
    let blocks = []
    for (let i in data)
      for (let j in data[i]) {
        let inputBlocks = data[i][j].input
          ? this._getInputNodes(data[i][j].input)
          : null
        blocks.push(
          <BlockRenderer
            key={'block ' + i + ' ' + j}
            ref={this.blocksRef[i][j]}
            data={data[i][j]}
            y={i}
            x={j}
            inputBlocks={inputBlocks}
          />
        )
      }
    return (
      <div ref={this.codeBlocks} className="codeBlocks">
        {blocks}
      </div>
    )
  }
}
