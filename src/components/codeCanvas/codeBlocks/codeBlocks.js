import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import BlockRenderer from '../../blockRenderer/blockRenderer'
import { roomWidth, lineHeight } from '../../constants'
import WireRenderer from '../../blockRenderer/wireRenderer'
import { operationalClick } from '../../main'

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
      focused: [], // [[y, x], [2, 9], [1, 0], ...]
    }
  }

  componentDidMount() {
    this.codeBlocks.current.addEventListener(
      'mousedown',
      this.handleMouseDown,
      true
    )
    // Add listener to codeCanvas
    document.addEventListener('click', this.handleClick)
    // Add delete block listener
    document.addEventListener('keydown', this.handleKeypress)
  }

  componentWillUnmount() {
    this.codeBlocks.current.removeEventListener(
      'mousedown',
      this.handleMouseDown,
      true
    )
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('keydown', this.handleKeypress)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data || !equal(nextState, this.state)
  }

  handleClick = e => {
    // Left click on the block, focus the clicked one
    if (
      (this.props.hovering && !this._hoveringOnBlock(e.target.classList)) ||
      (!this.props.hovering && !operationalClick(e.target))
    )
      this._blurAll()
  }

  handleMouseDown = e => {
    const that = this
    if (e.which === 1) {
      if (this._hoveringOnBlock(e.target.classList)) {
        e.preventDefault()
        // BLOCK
        const thisBlockInd = this._findBlock(e.target)
        if (thisBlockInd) {
          const thisBlock = this.blocksRef[thisBlockInd[0]][thisBlockInd[1]]
          if (thisBlock) {
            // FOCUS CURRENT
            this._focus(thisBlockInd) // [2, 0] - [y, x]
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
            // Add listener to codeCanvas
            codeBlocksCurrent.parentElement.addEventListener(
              'mousemove',
              handleMove,
              true
            )
            document.addEventListener(
              'mouseup',
              function _listener() {
                codeBlocksCurrent.parentElement.removeEventListener(
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

  handleKeypress = e => {
    if (e.key === 'Backspace')
      for (let i in this.state.focused) {
        const f = this.state.focused[i]
        // Remove from data
        this.props.collect(f, 'deleteBlock')
        // Remove ref
        delete this.blocksRef[f[0]][f[1]]
        if (Object.keys(this.blocksRef[f[0]]).length === 0)
          delete this.blocksRef[f[0]]
        // Remove nodes offset
        this.deleteNodesOffset(f[1], f[0])
        // Remove all focused (blur all)
        this._blurAll()
      }
  }

  _hoveringOnBlock(classList) {
    const checkList = [
      'blockFill',
      'blockRoom',
      'node',
      'inputBox',
      'sliderComponent',
      'wireHolder',
      'wire',
      'wireBackground',
    ]
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

  _helper_getInd = bInd => {
    for (let i in this.state.focused)
      if (
        this.state.focused[i][0] === bInd[0] &&
        this.state.focused[i][1] === bInd[1]
      )
        return i
    return -1
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
    let index = this._helper_getInd(bInd)
    if (index !== -1)
      this.setState({ focused: [...this.state.focused].splice(index, 1) })
  }

  _blurAll = () => {
    this.setState({ focused: [] })
  }

  _isFocused = bInd => {
    return this._helper_getInd(bInd) === -1 ? false : true
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
      if (Object.keys(newState.nodesOffset[y]).length === 0)
        delete newState.nodesOffset[y]

      return newState
    })
  }

  render() {
    const { data, collect } = this.props
    let blocks = []
    for (let i in data) // y
      for (let j in data[i]) {
        // x
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
            focused={this._isFocused([i, j])}
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
        />
        {blocks}
      </div>
    )
  }
}
