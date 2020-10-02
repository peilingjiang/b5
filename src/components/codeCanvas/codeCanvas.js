import React, { Component } from 'react'
import equal from 'react-fast-compare'
import ResizeObserver from 'resize-observer-polyfill'

import {
  lineHeight,
  roomWidth,
  lineNumberWidth,
  blockAlphabetHeight,
} from '../constants'
import * as method from './codeCanvasMethod'
import { LineNumberRoom, BlockAlphabetRoom, BlockRoom } from './codeCanvasFrags'
import CodeBlocks from '../codeBlocks/codeBlocks'
import '../../postcss/components/codeCanvas/codeCanvas.css'

import DoubleClick from '../../img/icon/dclick.svg'

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
    }

    */
    super(props)
    this.state = {
      render: {
        lineCount: 0, // # of lines
        blockCount: 0, // # of block rooms for each line
        // maxIndX: 0, // Max index (with block in the room) on x-axis (horizontally)
        // maxIndY: 0, // Max index (with block in the room) on y-axis (vertically)
        hovering: false,
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
  }

  componentDidMount() {
    const { thisCodeCanvasRef } = this.props
    this.codeCanvas = thisCodeCanvasRef.current
    /* Init canvasStyle */
    // Transform
    this.blockAlphabets.style.left = this.blockHome.style.left =
      this.state.left + 'px'
    this.lineNumbers.style.top = this.blockHome.style.top =
      this.state.top + 'px'
    // Scale
    this.codeCanvas.style.transform = 'scale(' + this.state.scale + ')'
    this.codeCanvas.style.width = 100 / this.state.scale + '%'
    this.codeCanvas.style.height = 100 / this.state.scale + '%'

    // Calc target counts and add listeners
    this._getSeclusionInd()
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
      return true
    }
    return !equal(this.state.render, nextState.render)
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
    if (e.which === 3)
      // Right click
      this.handlePan(e)
  }

  handlePan = e => {
    e.preventDefault()
    this.codeCanvas.className = 'codeCanvas grabbing'

    let that = this
    let mouse = {
      x: e.clientX,
      y: e.clientY,
      homeLeft: this.blockHome.offsetLeft,
      homeTop: this.blockHome.offsetTop,
    }

    function grabCanvas(e) {
      let delta = {
        x: e.clientX - mouse.x,
        y: e.clientY - mouse.y,
      }
      that._moveCanvas(mouse.homeLeft, mouse.homeTop, delta.x, delta.y)
    }

    this.codeCanvas.addEventListener('mousemove', grabCanvas, true)

    document.addEventListener(
      'mouseup',
      function _listener() {
        that.codeCanvas.className = 'codeCanvas'
        that.codeCanvas.removeEventListener('mousemove', grabCanvas, true)

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
    this.blockAlphabets.style.left = this.blockHome.style.left =
      Math.min(
        Math.max(
          startLeft + deltaX / this.state.scale,
          -this.maxBlockCount * roomWidth + this.codeCanvas.offsetWidth / 2
        ),
        lineNumberWidth
      ) + 'px'
    this.lineNumbers.style.top = this.blockHome.style.top =
      Math.min(
        Math.max(
          startTop + deltaY / this.state.scale,
          -this.maxLineCount * lineHeight + this.codeCanvas.offsetHeight / 2
        ),
        blockAlphabetHeight
      ) + 'px'
  }

  handleWheel = e => {
    e.preventDefault()

    if (e.metaKey) {
      // command or win key pressed
      // Scroll UP and DOWN
      this._moveCanvas(
        this.blockHome.offsetLeft,
        this.blockHome.offsetTop,
        -e.deltaX,
        -e.deltaY
      )
      this._setCanvasLeftTop()
      return
    }

    if (e.shiftKey) {
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
    this.setState({
      scale:
        Math.round(
          Math.min(
            Math.max(
              this.state.scale - e.deltaY * 0.0006 /* Zoom factor */,
              0.6 // MIN
            ),
            2 // MAX
          ) * 1000
        ) / 1000,
    })
    this.codeCanvas.style.transform = 'scale(' + this.state.scale + ')'
    this.codeCanvas.style.width = 100 / this.state.scale + '%'
    this.codeCanvas.style.height = 100 / this.state.scale + '%'

    clearTimeout(this.zoomTimer)
    this.zoomTimer = setTimeout(() => {
      this._refreshCodeCanvasCounts()
      this._handleCollectEditorCanvasStyle()
    }, 100)
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

  _refreshCodeCanvasCounts() {
    // Get target room counts for lines and blocks per line
    // and update this.state.lineCount and this.state.blockCount
    let render = { ...this.state.render }

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

  render() {
    let lineNumbers = [],
      blockAlphabets = [],
      blockHome = []

    const {
        render: { lineCount, blockCount },
        scale,
      } = this.state,
      {
        data: { blocks },
        thisCodeCanvasRef,
      } = this.props

    for (let i = 0; i < lineCount; i++) {
      // Key - 'line 17'
      lineNumbers.push(<LineNumberRoom key={'lineNumber ' + i} num={i} />)
      for (let j = 0; j < blockCount; j++) {
        // Key - 'block 2 17' (line 2, column 17)
        blockHome.push(
          <BlockRoom key={'blockRoom ' + i + ' ' + j} y={i} x={j} />
        )
      }
    }
    for (let j = 0; j < blockCount; j++) {
      blockAlphabets.push(
        <BlockAlphabetRoom key={'blockNumber ' + j} num={j} />
      )
    }

    return (
      <div ref={thisCodeCanvasRef} className="codeCanvas">
        {/* blockHome */}
        <div ref={e => (this.blockHome = e)} className="blockHome">
          {blockHome}

          {/* Tips or codeBlocks */}
          {Object.keys(blocks).length === 0 && (
            <div className="visible">
              <img src={DoubleClick} alt="Double Click" />
              <p>Double click to add a block</p>
            </div>
          )}
          <CodeBlocks
            data={blocks}
            canvas={{
              lineCount: lineCount,
              blockCount: blockCount,
            }}
            collect={this.handleCollectEditorData}
            scale={scale}
            hovering={this.state.render.hovering}
          />
        </div>

        {/* blockAlphabets */}
        <div ref={e => (this.blockAlphabets = e)} className="blockAlphabets">
          {blockAlphabets}
        </div>
        {/* lineNumbers */}
        <div ref={e => (this.lineNumbers = e)} className="lineNumbers">
          {lineNumbers}
        </div>
        {/* lineJoint */}
        <div className="lineJoint"></div>
      </div>
    )
  }
}
