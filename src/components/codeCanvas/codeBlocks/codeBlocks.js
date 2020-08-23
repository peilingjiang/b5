import React, { Component, createRef } from 'react'

import BlockRenderer from '../../blockRenderer/blockRenderer'
import { roomWidth, lineHeight } from '../../constants'
import WireRenderer from '../../blockRenderer/wireRenderer'

export default class CodeBlocks extends Component {
  constructor(props) {
    super(props) // data, canvas, collect, scale (for moving)

    // Create Refs for each block
    const { data } = props
    this.blocksRef = {}
    for (let i in data) {
      if (!this.blocksRef[i]) this.blocksRef[i] = {}
      for (let j in data[i]) this.blocksRef[i][j] = createRef()
    }

    this.codeBlocks = createRef()

    this.state = {
      nodesOffset: {},
    }
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

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.data !== this.props.data ||
      nextState.nodesOffset !== this.state.nodesOffset
    )
  }

  handleMouseDown = e => {
    const that = this
    if (!e.target.classList.contains('blockFill') && e.which !== 3) {
      if (this._hoveringOnBlock(e.target.classList)) {
        e.preventDefault()
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
            nodesOffset: this.state.nodesOffset[thisBlockInd[0]][
              thisBlockInd[1]
            ],
          }

          const handleMove = this.handleMoveBlock.bind(this, {
            m: mouse,
            b: thisBlock.current,
            bX: thisBlockInd[1],
            bY: thisBlockInd[0],
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
    const { m, b, bX, bY } = props // mouse, thisBlock.current
    const {
      canvas: { lineCount, blockCount },
    } = this.props

    let delta = {
      x: Math.max(
        Math.min(
          (e.clientX - m.x) / this.props.scale,
          (blockCount - 1) * roomWidth - m.blockLeft
        ),
        -m.blockLeft
      ),
      y: Math.max(
        Math.min(
          (e.clientY - m.y) / this.props.scale,
          (lineCount - 1) * lineHeight - m.blockTop
        ),
        -m.blockTop
      ),
    }

    b.style.left = delta.x + m.blockLeft + 'px'
    b.style.top = delta.y + m.blockTop + 'px'

    // Update node offset
    let oldData = JSON.parse(JSON.stringify(m.nodesOffset))
    for (let i in oldData.input) {
      oldData.input[i][0] += delta.x
      oldData.input[i][1] += delta.y
    }
    for (let i in oldData.output) {
      oldData.output[i][0] += delta.x
      oldData.output[i][1] += delta.y
    }
    this.collectNodesOffset(bX, bY, oldData)
  }

  _hoveringOnBlock(classList) {
    const checkList = ['node', 'inputBox', 'sliderComponent']
    for (let i in checkList) if (classList.contains(checkList[i])) return false
    return true
  }

  _hasParentOrChildInTheSameLine(bD, y) {
    if (bD.input)
      // Inputs cannot be below the block
      for (let i in bD.input)
        if (bD.input[i] !== null && bD.input[i][0] >= y) return true
    if (bD.output)
      // Outputs cannot be above the block
      for (let i in bD.output)
        if (bD.output[i] !== null && bD.output[i][0] <= y) return true

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
      // Already occupied - send block back to original position
      blockCurrent.style.left = m.blockLeft + 'px'
      blockCurrent.style.top = m.blockTop + 'px'
      this.collectNodesOffset(bInd[1], bInd[0], m.nodesOffset)
    } else {
      // Successfully moved!

      // Remove node offset
      this.deleteNodesOffset(bInd[1], bInd[0])

      blockCurrent.style.left = x * roomWidth + 'px'
      blockCurrent.style.top = y * lineHeight + 'px'

      // Handle ref
      // Create new
      if (!this.blocksRef[y]) this.blocksRef[y] = {}
      this.blocksRef[y][x] = createRef()
      // Remove old
      delete this.blocksRef[bInd[0]][bInd[1]]
      if (this.blocksRef[bInd[0]] === {}) delete this.blocksRef[bInd[0]]

      this.props.collect([bInd[1], bInd[0], x, y], 'relocateBlock')
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

  collectNodesOffset = (x, y, data) => {
    /*
    
    > data
    {
      input: [[x1, y1], [x2, y2]],
      output: [],
    }

    */
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))
      if (!newState.nodesOffset[y]) newState.nodesOffset[y] = {}
      newState.nodesOffset[y][x] = data

      return newState
    })
  }

  deleteNodesOffset = (x, y) => {
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))

      delete newState.nodesOffset[y][x]
      if (Object.keys(newState.nodesOffset[y]).length === 0) delete newState[y]

      return newState
    })
  }

  render() {
    const { data, collect } = this.props
    let blocks = []
    for (let i in data)
      for (let j in data[i]) {
        let inputBlocks = data[i][j].input
          ? this._getInputNodes(data[i][j].input)
          : null
        blocks.push(
          <BlockRenderer
            key={'block ' + i + ' ' + j}
            thisBlockRef={this.blocksRef[i][j]}
            data={data[i][j]}
            y={i}
            x={j}
            inputBlocks={inputBlocks}
            collect={collect}
            collectNodesOffset={this.collectNodesOffset}
          />
        )
      }

    return (
      <div ref={this.codeBlocks} className="codeBlocks">
        <WireRenderer data={data} nodesOffset={this.state.nodesOffset} />
        {blocks}
      </div>
    )
  }
}
