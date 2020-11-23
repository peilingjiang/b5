import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'
import ResizeObserver from 'resize-observer-polyfill'

import _b from '../editor/b5ObjectWrapper'

import {
  lineHeight,
  roomWidth,
  lineNumberWidth,
  blockAlphabetHeight,
} from '../constants'
import * as method from './codeCanvasMethod'

import CodeBlocks from '../codeBlocks/codeBlocks'
import '../../postcss/components/codeCanvas/codeCanvas.css'

import { _colorEffectIndex } from '../magicalIndex'
import { CanvasAxis, CanvasGrid } from './canvasGrid'

export default class CodeCanvas extends Component {
  constructor(props) {
    /*

    > props
    {
      maxLineCount: 3, // (Required)

      maxBlockCount: 3, // (Required)
      
      data: {
        name: 'cnv', // playground canvas doesn't have
        removable: false, // playground canvas doesn't have
        type: 'playground', // (Required)
        lineStyle: {}, // (Required)
        blocks: {}, // (Required)
      },
      
      canvasStyle: {
        left: 0, // (Required)
        top: 0, // (Required)
        scale: 1, // (Required)
      },

      collect, // (Required)
      collectStyle, // (Required)

      thisCodeCanvasRef, // (Required)
      hardRefresh, // (Required)

      canvasId, // Currently for playground canvas
    }

    */
    super(props)
    this.state = {
      render: {
        lineStartCount: 0, // Start # of lines rendering (New for 0.0.9)
        blockStartCount: 0, // Start # of blocks rendering (New for 0.0.9)
        lineCount: 0, // # of lines
        blockCount: 0, // # of block rooms for each line
        // maxIndX: 0, // Max index (with block in the room) on x-axis (horizontally)
        // maxIndY: 0, // Max index (with block in the room) on y-axis (vertically)
        hovering: false,
        colorEffectActivated: [], // Location of activated color effect block
      },
      /* canvasStyle */
      left: props.canvasStyle.left, // Left offset (codeCanvas) after dragging
      top: props.canvasStyle.top, // Top offset (codeCanvas) after dragging
      scale: props.canvasStyle.scale, // codeCanvas scale
      /* data */
      // lineStyles: props.data.lineStyles, // Store all the rooms (with styles modified)
      // blocks: props.data.blocks, // Store all the block
      addBlock: false, // Whether to add (searching) a block or not
    }
    /*
    this.state.lineStyles only stores lines with modified drawing styles.

    > this.state.lineStyles
    {
      '17': { // Line number
        'fill': '#00d1ff',
        'stroke': 'none',
      }
    }

    */
    this.zoomTimer = null // Avoid continuous re-rendering
    this.resizeTimer = null

    this.maxLineCount = props.maxLineCount
    this.maxBlockCount = props.maxBlockCount
    // >>
    this.maxAllBlockHeight = this.maxLineCount * lineHeight
    this.maxAllBlockWidth = this.maxBlockCount * roomWidth

    // (Different from the type of blocks - object, variable...)
    this.type = props.data.type // 'playground', 'variable'...

    this.resizeObserver = new ResizeObserver(e => {
      this.handleResize()
    })

    // Collect function
    this.handleCollectEditorData = this.handleCollectEditorData.bind(this)

    this.seclusionInd = {
      x: 0,
      y: 0,
    }

    this.colorEffectInd = []
    this.mouseIsDown = false

    // Grid
    this.blockAlphabets = createRef()
    this.lineNumbers = createRef()
  }

  componentDidMount() {
    const { thisCodeCanvasRef } = this.props
    this.codeCanvas = thisCodeCanvasRef.current
    /* Init canvasStyle */
    // Transform
    this.blockAlphabets.current.style.left = this.blockHome.style.left =
      this.state.left + 'px'
    this.lineNumbers.current.style.top = this.blockHome.style.top =
      this.state.top + 'px'
    // Scale
    this.codeCanvas.style.transform = 'scale(' + this.state.scale + ')'
    this.codeCanvas.style.width = 100 / this.state.scale + '%'
    this.codeCanvas.style.height = 100 / this.state.scale + '%'

    // Calc target counts and add listeners
    this._getSeclusionInd()
    this._getColorEffectInd()
    this._refreshCodeCanvasCounts()
    this.codeCanvas.addEventListener('mousedown', this.handleMouseDown, true)
    this.codeCanvas.addEventListener('wheel', this.handleWheel, true)
    this.resizeObserver.observe(this.codeCanvas)

    this.codeCanvas.addEventListener('contextmenu', this.rightClick, true)

    this.codeCanvas.addEventListener('mouseenter', this.handleHover)
    this.codeCanvas.addEventListener('mouseleave', this.handleLeave)

    // Add block
    this.codeCanvas.addEventListener('dblclick', this.handleDoubleClick)
  }

  componentWillUnmount() {
    this.codeCanvas.removeEventListener('mousedown', this.handleMouseDown, true)
    this.codeCanvas.removeEventListener('wheel', this.handleWheel, true)
    this.resizeObserver.unobserve(this.codeCanvas)
    this.codeCanvas.removeEventListener('contextmenu', this.rightClick, true)
    this.codeCanvas.removeEventListener('mouseenter', this.handleHover)
    this.codeCanvas.removeEventListener('mouseleave', this.handleLeave)
    this.codeCanvas.removeEventListener('dblclick', this.handleDoubleClick)

    this.codeCanvas = null
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!equal(this.props.data, nextProps.data)) {
      this._getSeclusionInd(nextProps.data.blocks)
      this._getColorEffectInd(nextProps.data.blocks)
      return true
    }
    return (
      !equal(this.state.render, nextState.render) ||
      !equal(this.state.scale, nextState.scale)
    )
  }

  // setEditor functions...
  handleCollectEditorData(data, task) {
    this.props.collect(data, task, this.type)
  }

  _handleCollectEditorCanvasStyle() {
    // 'Upload' styles (left, top, scale) to Editor
    this.props.collectStyle(
      (({ left, top, scale }) => ({ left, top, scale }))(this.state),
      this.type
    )
  }

  handleDoubleClick = e => {
    if (e.target.classList.contains('blockRoom')) {
      // Clicking on an empty blockRoom
      const ind = method.getYX(e.target, this.codeCanvas)
      this.handleCollectEditorData(ind, 'preSearchBlock')
    }
  }

  handleMouseDown = e => {
    const that = this
    that.mouseIsDown = true
    if (e.which === 3)
      // Right click
      this.handlePan(e)
    else
      document.addEventListener('mouseup', function _listener() {
        that.mouseIsDown = false
        document.removeEventListener('mouseup', _listener)
      })
  }

  handlePan = e => {
    e.preventDefault()
    this.codeCanvas.className = 'codeCanvas grabbing'

    const that = this
    let mouse = {
      x: e.clientX,
      y: e.clientY,
      homeLeft: this.blockHome.offsetLeft,
      homeTop: this.blockHome.offsetTop,
    }

    function grabCanvas(e) {
      that._moveCanvas(
        mouse.homeLeft,
        mouse.homeTop,
        e.clientX - mouse.x,
        e.clientY - mouse.y
      )
    }

    document.addEventListener('mousemove', grabCanvas, true)

    document.addEventListener(
      'mouseup',
      function _listener() {
        that.mouseIsDown = false
        that.codeCanvas.className = 'codeCanvas'
        document.removeEventListener('mousemove', grabCanvas, true)

        that._setCanvasLeftTop()

        document.removeEventListener('mouseup', _listener, true)
      },
      true
    )
  }

  _setCanvasLeftTop = () => {
    this.setState(
      {
        left: this.blockHome.offsetLeft,
        top: this.blockHome.offsetTop,
      },
      () => {
        this._refreshCodeCanvasCounts()
        this._handleCollectEditorCanvasStyle()
      }
    )
  }

  _moveCanvas = (startLeft, startTop, deltaX, deltaY) => {
    this.blockAlphabets.current.style.left = this.blockHome.style.left =
      Math.min(
        Math.max(
          startLeft + deltaX / this.state.scale,
          -this.maxAllBlockWidth + this.codeCanvas.offsetWidth / 2
        ),
        lineNumberWidth
      ) + 'px'
    this.lineNumbers.current.style.top = this.blockHome.style.top =
      Math.min(
        Math.max(
          startTop + deltaY / this.state.scale,
          -this.maxAllBlockHeight + this.codeCanvas.offsetHeight / 2
        ),
        blockAlphabetHeight
      ) + 'px'
  }

  handleWheel = e => {
    if (method.scrollOnComponent(e.toElement.classList)) return
    e.preventDefault()

    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      // command or win / control key pressed
      // Scroll UP and DOWN
      //
      // shift pressed
      // Scroll LEFT and RIGHT
      this._moveCanvas(
        this.blockHome.offsetLeft,
        this.blockHome.offsetTop,
        -e.deltaX,
        -e.deltaY
      )
      this._setCanvasLeftTop()
      return
    }

    // * SCALE
    if (!this.mouseIsDown) {
      const s =
        Math.round(
          Math.min(
            Math.max(
              this.state.scale - e.deltaY * 0.0006 /* Zoom factor */,
              0.5 // MIN
            ),
            1.7 // MAX
          ) * 20
        ) * 0.05

      if (s !== this.state.scale) {
        this.setState({
          scale: s,
        })
        this.codeCanvas.style.transform = 'scale(' + s + ')'
        this.codeCanvas.style.width = 100 / s + '%'
        this.codeCanvas.style.height = 100 / s + '%'
      }

      clearTimeout(this.zoomTimer)
      this.zoomTimer = setTimeout(() => {
        this._refreshCodeCanvasCounts()
        this._handleCollectEditorCanvasStyle()
      }, 50)
    }
  }

  handleResize = e => {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      this._refreshCodeCanvasCounts()
      // Upload sectionHeight
      if (this.type !== 'playground') this._handleCollectEditorCanvasStyle()
    }, 50)
  }

  rightClick = e => {
    e.preventDefault()
  }

  handleHover = e => {
    let render = { ...this.state.render }
    render.hovering = true
    this.setState({ render })
  }

  handleLeave = e => {
    let render = { ...this.state.render }
    render.hovering = false
    this.setState({ render })
  }

  _getSeclusionInd(dataBlocks = null) {
    // Get the indices for furthest blocks in codeCanvas
    // Update only on block changes
    const blocks = dataBlocks || this.props.data.blocks

    if (Object.entries(blocks).length === 0) {
      // No block in codeCanvas
      this.seclusionInd.y = 0
      this.seclusionInd.x = 0
      return
    }

    this.seclusionInd.y = Math.max.apply(null, Object.keys(blocks)) // Max line number
    this.seclusionInd.x = Math.max.apply(
      null,
      Object.keys(blocks).map(lk =>
        Math.max.apply(null, Object.keys(blocks[lk]))
      )
    ) // Max column number
  }

  _getColorEffectInd(dataBlocks = null) {
    // Get the location of all color effect blocks
    const blocks = dataBlocks || this.props.data.blocks

    const this_bBlocks =
      this.props.data.type === 'playground'
        ? _b.playground.blocks
        : _b.factory[this.props.data.type][this.props.data.name].blocks

    this.colorEffectInd = []
    for (let i in blocks)
      for (let j in blocks[i])
        if (_colorEffectIndex.includes(blocks[i][j].name))
          // ! Color of affected background
          try {
            this.colorEffectInd.push([
              i,
              j,
              this_bBlocks[i][j].blockColorEffect(),
              method.getEffectName(blocks[i][j].name),
            ])
          } catch (error) {}
  }

  _refreshCodeCanvasCounts() {
    // Get target room counts for lines and blocks per line
    // and update this.state.lineCount and this.state.blockCount
    let render = { ...this.state.render }

    render.lineStartCount = Math.max(
      Math.floor(-this.state.top / lineHeight),
      0
    )
    render.blockStartCount = Math.max(
      Math.floor(-this.state.left / roomWidth),
      0
    )

    render.lineCount = Math.min(
      Math.max(
        Math.ceil((this.codeCanvas.clientHeight - this.state.top) / lineHeight),
        this.seclusionInd.y + 2 // Always one more block room to the most seclusive block
      ),
      this.maxLineCount
    )
    render.blockCount = Math.min(
      Math.max(
        Math.ceil((this.codeCanvas.clientWidth - this.state.left) / roomWidth),
        this.seclusionInd.x + 2
      ),
      this.maxBlockCount
    )

    this.setState({ render })
  }

  handleFocused = focused => {
    let render = { ...this.state.render }
    render.colorEffectActivated = []
    if (focused && focused.length) {
      // fill or stroke
      for (let i of focused) // [[y, x], [2, 9], [1, 0], ...]
        for (let j of this.colorEffectInd)
          if (i[0] === j[0] && i[1] === j[1])
            render.colorEffectActivated.push(i)
    }
    this.setState({ render })
  }

  _getRoomBackground = (y, x) => {
    // Get the background color for the block
    const { colorEffectActivated } = this.state.render

    if (!colorEffectActivated.length) return null

    let lastCompare = [-1, -1, null, null]
    let color = null
    for (let c of this.colorEffectInd) {
      if (
        method.hasGreaterEqualPosition(y, x, c[0], c[1]) &&
        method.hasGreaterEqualPosition(
          c[0],
          c[1],
          lastCompare[0],
          lastCompare[1]
        )
      ) {
        if (method.isColorActivated(colorEffectActivated, c)) {
          color = c[2]
          lastCompare = c
        } else if (c[3] === lastCompare[3] || lastCompare[3] === null) {
          color = null
        }
      }
    }

    return color
  }

  render() {
    const {
        render: { lineStartCount, blockStartCount, lineCount, blockCount },
        scale,
      } = this.state,
      {
        data: { blocks },
        thisCodeCanvasRef,
        hardRefresh,
        canvasId,
      } = this.props

    return (
      <div
        ref={thisCodeCanvasRef}
        className="codeCanvas"
        id={canvasId ? canvasId : null}
      >
        <div ref={e => (this.blockHome = e)} className="blockHome">
          <CanvasGrid
            hasBlock={Object(blocks).length !== 0}
            lineStartCount={lineStartCount}
            blockStartCount={blockStartCount}
            lineCount={lineCount}
            blockCount={blockCount}
            getRoomBackground={this._getRoomBackground}
            colorEffectActivated={this.state.render.colorEffectActivated}
          />

          <CodeBlocks
            data={blocks}
            canvas={{
              lineCount: lineCount,
              blockCount: blockCount,
            }}
            collect={this.handleCollectEditorData}
            scale={scale}
            hovering={this.state.render.hovering}
            canvasCollectFocused={this.handleFocused}
            hardRefresh={hardRefresh}
          />
        </div>

        <CanvasAxis
          lineCount={lineCount}
          blockCount={blockCount}
          blockAlphabetsRef={this.blockAlphabets}
          lineNumbersRef={this.lineNumbers}
        />
      </div>
    )
  }
}
