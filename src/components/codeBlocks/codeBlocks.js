import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import BlockRenderer from '../blockRenderer/blockRenderer'
import { roomWidth, lineHeight } from '../constants'
import WireRenderer from '../blockRenderer/wireRenderer'
import {
  hoveringOnBlock,
  hoveringOnWire,
  operationalClick,
  helper_getInd,
  _addClassNameByClass,
  _removeClassNameByClass,
} from './codeBlocksMethod'

export default class CodeBlocks extends Component {
  constructor(props) {
    super() // data, canvas, collect, scale (for moving)

    // Create Refs for each block
    const { data } = props

    this.blocksRef = {}

    for (let i in data) {
      if (!this.blocksRef[i]) this.blocksRef[i] = {}
      for (let j in data[i]) this.blocksRef[i][j] = createRef()
    }

    this.codeBlocks = createRef()
    this.blocksNodesRef = {}

    this.state = {
      draggingWire: null, // Trying to add new connection, render temp wire
      nodesOffset: {},
      focused: [], // [[y, x], [2, 9], [1, 0], ...]
      selectedWire: [], // [[y, x, node], ...]
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleMouseDown, true)
    // document.addEventListener('click', this.handleClick)
    // Add delete block listener
    document.addEventListener('keydown', this.handleKeypress)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleMouseDown, true)
    // document.removeEventListener('click', this.handleClick)
    document.removeEventListener('keydown', this.handleKeypress)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!equal(nextProps.data, this.props.data)) {
      // Data updated, e.g. added a new block in block search
      for (let y in nextProps.data) {
        if (!this.blocksRef[y]) this.blocksRef[y] = {}
        for (let x in nextProps.data[y])
          if (!this.blocksRef[y][x]) this.blocksRef[y][x] = createRef()
      }
    }
    return (
      !equal(nextProps.data, this.props.data) || !equal(nextState, this.state)
    )
  }

  handleClick = e => {}

  handleMouseDown = e => {
    if (e.which === 1) {
      // If:
      // Hovering on the canvas but not click on the block, or
      // Not hovering on the canvas and not doing "operational" tasks
      // Then: _blurAll()
      if (!this.props.hovering && !operationalClick(e.target)) {
        this._blurAll()
        this._deselectWireAll()
      } else if (this.props.hovering) {
        if (!hoveringOnBlock(e.target.classList)) this._blurAll()
        if (!hoveringOnWire(e.target.classList)) this._deselectWireAll()

        const that = this
        const thisBlockInd = this._findBlock(e.target)
        if (hoveringOnBlock(e.target.classList)) {
          // BLOCK
          e.preventDefault()
          if (thisBlockInd) {
            const thisBlock = this.blocksRef[thisBlockInd[0]][thisBlockInd[1]]
            if (thisBlock) {
              // FOCUS CURRENT
              this._focus(thisBlockInd) // [2, 0] - [y, x]
              this.props.canvasCollectFocused(this.state.focused) // Send focused to codeCanvas

              this._deselectWireAll()
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

              // const codeBlocksCurrent = this.codeBlocks.current
              // Add listener to document instead of codeCanvas
              _addClassNameByClass(thisBlock, 'node', 'no-events')
              document.addEventListener('mousemove', handleMove, true)
              document.addEventListener(
                'mouseup',
                function _listener() {
                  _removeClassNameByClass(thisBlock, 'node', 'no-events')
                  document.removeEventListener('mousemove', handleMove, true)
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
          }
        } else if (e.target.classList.contains('node')) {
          // NODE
          e.preventDefault()
          this._deselectWireAll()
          if (thisBlockInd) {
            const thisNodesRef = this.blocksNodesRef[thisBlockInd[0]][
              thisBlockInd[1]
            ]
            for (let io in thisNodesRef) // "input" or "output"
              for (let j in thisNodesRef[io]) // "0", "1", ...
                if (thisNodesRef[io][j].current === e.target) {
                  const that = this
                  let mouse = {
                    x: e.clientX,
                    y: e.clientY,
                  }

                  thisNodesRef[io][j].current.classList.add('focused')
                  document.body.style.cursor = 'pointer'
                  // Avoid cursor style change when hovering on blocks
                  this.codeBlocks.current.style.pointerEvents = 'none'

                  const startNode = {
                    startNodeType: io,
                    startNodeInd: j,
                    startNodeRef: thisNodesRef[io][j],
                  }

                  const dragWire = this.handleDragWire.bind(this, {
                    ...startNode,
                    startBlockInd: thisBlockInd,
                    m: mouse,
                  })
                  // Add the listener to codeCanvas
                  this.codeBlocks.current.parentElement.addEventListener(
                    'mousemove',
                    dragWire
                  )

                  // On mouseup
                  document.addEventListener('mouseup', function _listener(e) {
                    that.codeBlocks.current.parentElement.removeEventListener(
                      'mousemove',
                      dragWire
                    )
                    that.codeBlocks.current.style.pointerEvents = 'initial'
                    that._checkConnect(e, startNode, thisBlockInd)
                    document.removeEventListener('mouseup', _listener)
                  })
                }
          }
        } else if (hoveringOnWire(e.target.classList)) {
          // WIRE
          const wireAttr = e.target.attributes
          this._selectWire(
            wireAttr['data-y'].nodeValue,
            wireAttr['data-x'].nodeValue,
            wireAttr['data-node'].nodeValue
          )
        }
      }
    }
  }

  handleDragWire = (props, e) => {
    const { startBlockInd, startNodeType, startNodeInd, m } = props
    let delta = {
      x: (e.clientX - m.x) / this.props.scale,
      y: (e.clientY - m.y) / this.props.scale,
    }

    const wireStart = this.state.nodesOffset[startBlockInd[0]][
      startBlockInd[1]
    ][startNodeType][startNodeInd]
    // Render temp Wire
    this.setState({
      draggingWire: {
        start: wireStart,
        end: [wireStart[0] + delta.x, wireStart[1] + delta.y],
      },
    })
  }

  _checkConnect = (e, sN, startBlockInd) => {
    const { startNodeType, startNodeInd, startNodeRef } = sN

    // Stop rendering temp wire
    startNodeRef.current.classList.remove('focused')
    document.body.style.cursor = 'auto'
    this.setState({ draggingWire: null })

    if (e.target.classList.contains('node')) {
      // Find end block
      const endBlockInd = this._findBlock(e.target)

      // Cannot connect to self
      if (equal(endBlockInd, startBlockInd)) return

      const thisNodesRef = this.blocksNodesRef[endBlockInd[0]][endBlockInd[1]]
      // this thisBlockInd must exists as hovering on node
      for (let ioEnd in thisNodesRef) // "input" or "output"
        for (let j in thisNodesRef[ioEnd]) // "0", "1", ...
          if (thisNodesRef[ioEnd][j].current === e.target) {
            // Cannot connect to same node type
            // Cannot connect to child with smaller y index or parent with larger
            if (
              ioEnd === startNodeType ||
              (ioEnd === 'input' && endBlockInd[0] <= startBlockInd[0]) ||
              (ioEnd === 'output' && endBlockInd[0] >= startBlockInd[0])
            )
              return

            // Collect - output data first, input data follows
            ioEnd === 'input'
              ? this.props.collect(
                  [startBlockInd, startNodeInd, endBlockInd, j],
                  'addConnection'
                )
              : this.props.collect(
                  [endBlockInd, j, startBlockInd, startNodeInd],
                  'addConnection'
                )
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

  handleKeypress = e => {
    if (e.key === 'Backspace') {
      if (this.state.focused.length) {
        // Theoretically, either focused or selectedWire will be []
        // However, if both kinds of them were selected (which is a bug)
        // Delete only blocks as priority
        e.preventDefault()
        for (let i in this.state.focused) {
          const f = this.state.focused[i]
          // Remove from data
          this.props.collect(f, 'deleteBlock')
          // Remove block ref
          delete this.blocksRef[f[0]][f[1]]
          if (Object.keys(this.blocksRef[f[0]]).length === 0)
            delete this.blocksRef[f[0]]
          // Remove nodes offset
          this.deleteNodesOffset(f[1], f[0])
          // Remove all focused (blur all)
          this._blurAll()
        }
      } else if (this.state.selectedWire.length)
        for (let i in this.state.selectedWire) {
          const w = this.state.selectedWire[i]
          // Remove from data
          this.props.collect(w, 'removeConnection')
          // Remove all selected
          this._deselectWireAll()
        }
    }
  }

  _hasParentOrChildInTheSameLine(bD, y) {
    if (bD.input)
      // Inputs cannot be below the block
      for (let i in bD.input)
        if (bD.input[i] !== null && bD.input[i][0] >= y) return true
    if (bD.output)
      // Outputs cannot be above the block
      for (let i in bD.output)
        for (let j in bD.output[i]) if (bD.output[i][j][0] <= y) return true

    return false
  }

  _checkMove(m, b, bInd) {
    // mouse, thisBlock, (old) blockInd
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

      this.props.collect(
        [bInd[1], bInd[0], x.toString(), y.toString()],
        'relocateBlock'
      )

      // Replace Focus
      this._blur(bInd)
      this._focus([y.toString(), x.toString()])
      this.props.canvasCollectFocused(this.state.focused) // Send focused to codeCanvas
    }
  }

  _findBlock(target) {
    // Find the blockFill target
    let depth = 0
    while (!target.classList.contains('blockFill') && depth < 5) {
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

  _focus = (bInd, add = false) => {
    // Do we need to check if bInd is in state?
    // add - true to add current, false to clear (blur all) and add current
    this.setState({
      focused: add
        ? [...this.state.focused, [bInd[0], bInd[1]]]
        : [[bInd[0], bInd[1]]],
    })
  }

  _blur = bInd => {
    let index = helper_getInd(this.state.focused, bInd)
    if (index !== -1)
      this.setState({ focused: [...this.state.focused].splice(index, 1) })
  }

  _blurAll = () => {
    if (this.state.focused.length)
      this.setState({ focused: [] }, function () {
        this.props.canvasCollectFocused()
      })
  }

  _isFocused = bInd => {
    return helper_getInd(this.state.focused, bInd) === -1 ? false : true
  }

  _selectWire = (y, x, node, add = false) => {
    this.setState({
      selectedWire: add
        ? [...this.state.selectedWire, [y, x, node]]
        : [[y, x, node]],
    })
  }

  _deselectWire = (y, x, node) => {
    let index = helper_getInd(this.state.selectedWire, [y, x, node])
    if (index !== -1)
      this.setState({
        selectedWire: [...this.state.selectedWire].splice(index, 1),
      })
  }

  _deselectWireAll = () => {
    if (this.state.selectedWire.length) this.setState({ selectedWire: [] })
  }

  _areSelectedNodes = (y, x) => {
    const selectedInNodes = this.state.selectedWire
    const { data } = this.props
    const r = {
      input: [],
      output: [],
    }
    /*
    
    > r
    {
      input: ['0'],
      output: ['1', '2'],
    }

    */
    // ADD INPUT
    for (let i in selectedInNodes)
      if (selectedInNodes[i][0] === y && selectedInNodes[i][1] === x)
        r.input.push(selectedInNodes[i][2])
    // ADD OUTPUT
    for (let i in selectedInNodes) {
      const [inY, inX, inNode] = selectedInNodes[i]
      if (data[inY][inX].input[inNode] !== null) {
        const [outY, outX, outNode] = data[inY][inX].input[inNode]
        if (outY === y && outX === x) r.output.push(outNode)
      }
    }
    return r
  }

  collectNodesOffset = (x, y, data, ref = null) => {
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

    if (ref) {
      // Collect ref for this.blocksNodesRef
      if (!this.blocksNodesRef[y]) this.blocksNodesRef[y] = {}
      this.blocksNodesRef[y][x] = ref
    }
  }

  deleteNodesOffset = (x, y) => {
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))

      delete newState.nodesOffset[y][x]
      if (Object.keys(newState.nodesOffset[y]).length === 0)
        delete newState.nodesOffset[y]

      return newState
    })
  }

  render() {
    const { data, collect, scale } = this.props
    const { draggingWire } = this.state
    let blocks = []
    for (let i in data) // y
      for (let j in data[i]) {
        // x
        let inputBlocks = data[i][j].input
          ? this._getInputNodes(data[i][j].input)
          : null
        blocks.push(
          <BlockRenderer
            action={true} // true === 'action', false === 'preview'
            key={'block ' + i + ' ' + j}
            thisBlockRef={this.blocksRef[i][j]}
            data={data[i][j]}
            y={i}
            x={j}
            scale={scale}
            inputBlocks={inputBlocks}
            focused={this._isFocused([i, j])}
            selectedNodes={this._areSelectedNodes(i, j)}
            collect={collect}
            collectNodesOffset={this.collectNodesOffset}
          />
        )
      }

    return (
      <div ref={this.codeBlocks} className="codeBlocks">
        <WireRenderer
          data={data}
          nodesOffset={this.state.nodesOffset}
          focused={this.state.focused}
          selectedWire={this.state.selectedWire}
          draggingWire={draggingWire}
        />
        {blocks}
      </div>
    )
  }
}
