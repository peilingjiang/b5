import React, { PureComponent } from 'react'

import {
  lineHeight,
  roomWidth,
  lineNumberWidth,
  blockAlphabetHeight,
} from '../constants'
import { LineNumberRoom, BlockAlphabetRoom, BlockRoom } from './codeCanvasFrags'
import CodeBlocks from '../codeBlocks/codeBlocks'
import '../../postcss/components/codeCanvas/codeCanvas.css'

import DoubleClick from '../../img/icon/dclick.svg'

export default class CodeCanvas extends PureComponent {
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
    }

    */
    super(props)
    this.state = {
      lineCount: 0, // # of lines
      blockCount: 0, // # of block rooms for each line
      maxIndX: 0, // Max index (with block in the room) on x-axis (horizontally)
      maxIndY: 0, // Max index (with block in the room) on y-axis (vertically)
      /* canvasStyle */
      left: props.canvasStyle.left, // Left offset (codeCanvas) after dragging
      top: props.canvasStyle.top, // Top offset (codeCanvas) after dragging
      scale: props.canvasStyle.scale, // codeCanvas scale
      /* data */
      lineStyles: props.data.lineStyles, // Store all the rooms (with styles modified)
      blocks: props.data.blocks, // Store all the block
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

    this.type = props.data.type

    this.resizeObserver = new ResizeObserver(e => {
      this.handleResize()
    })
  }

  componentDidMount() {
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
    this.codeCanvas.addEventListener('mousedown', this.handlePan, true)
    this.codeCanvas.addEventListener('wheel', this.handleZoom, true)
    this.resizeObserver.observe(this.codeCanvas)

    this.codeCanvas.addEventListener('contextmenu', this.rightClick, true)
  }

  componentWillUnmount() {
    this.codeCanvas.removeEventListener('mousedown', this.handlePan, true)
    this.codeCanvas.removeEventListener('wheel', this.handleZoom, true)
    this.resizeObserver.unobserve(this.codeCanvas)

    this.codeCanvas.removeEventListener('contextmenu', this.rightClick, true)
  }

  _handleStyleUpload() {
    // 'Upload' styles (left, top, scale) to Editor
    this.props.collectStyle(
      this.type,
      (({ left, top, scale }) => ({ left, top, scale }))(this.state)
    )
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
      that.blockAlphabets.style.left = that.blockHome.style.left =
        Math.min(
          Math.max(
            mouse.homeLeft + delta.x,
            -that.maxBlockCount * roomWidth + that.codeCanvas.offsetWidth / 2
          ),
          lineNumberWidth
        ) + 'px'
      that.lineNumbers.style.top = that.blockHome.style.top =
        Math.min(
          Math.max(
            mouse.homeTop + delta.y,
            -that.maxLineCount * lineHeight + that.codeCanvas.offsetHeight / 2
          ),
          blockAlphabetHeight
        ) + 'px'
    }

    this.codeCanvas.addEventListener('mousemove', grabCanvas, true)

    document.addEventListener(
      'mouseup',
      function _listener() {
        that.codeCanvas.className = 'codeCanvas grab'
        that.codeCanvas.removeEventListener('mousemove', grabCanvas, true)

        that.setState(
          {
            left: that.blockHome.offsetLeft,
            top: that.blockHome.offsetTop,
          },
          () => {
            that._refreshCodeCanvasCounts()
            that._handleStyleUpload()
          }
        )

        document.removeEventListener('mouseup', _listener, true)
      },
      true
    )
  }

  handleZoom = e => {
    e.preventDefault()

    this.setState({
      scale:
        Math.round(
          Math.min(
            Math.max(
              this.state.scale - e.deltaY * 0.0005 /* Zoom factor */,
              0.6
            ),
            1.1
          ) * 1000
        ) / 1000,
    })
    this.codeCanvas.style.transform = 'scale(' + this.state.scale + ')'
    this.codeCanvas.style.width = 100 / this.state.scale + '%'
    this.codeCanvas.style.height = 100 / this.state.scale + '%'

    clearTimeout(this.zoomTimer)
    this.zoomTimer = setTimeout(() => {
      this._refreshCodeCanvasCounts()
      this._handleStyleUpload()
    }, 100)
  }

  handleResize = e => {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      this._refreshCodeCanvasCounts()
      // Upload sectionHeight
      if (this.type !== 'playground') this._handleStyleUpload()
    }, 50)
  }

  rightClick = e => {
    e.preventDefault()
  }

  _getSeclusionInd() {
    // Get the indices for furthest blocks in codeCanvas
    // Update only on block changes

    Object.entries(this.state.blocks).length === 0
      ? // No block in codeCanvas
        this.setState({
          maxIndX: 0,
          maxIndY: 0,
        })
      : this.setState({
          maxIndY: Math.max.apply(null, Object.keys(this.state.blocks)), // Max line number
          maxIndX: Math.max.apply(
            null,
            Object.keys(this.state.blocks).map(lk =>
              Math.max.apply(null, Object.keys(this.state.blocks[lk]))
            )
          ), // Max column number
        })
  }

  _refreshCodeCanvasCounts() {
    // Get target room counts for lines and blocks per line
    // and update this.state.lineCount and this.state.blockCount
    this.setState({
      lineCount: Math.min(
        Math.max(
          Math.ceil(
            (this.codeCanvas.clientHeight - this.state.top) / lineHeight
          ),
          this.state.maxIndY + 1 // Always one more block room to the most seclusive block
        ),
        this.maxLineCount
      ),
      blockCount: Math.min(
        Math.max(
          Math.ceil(
            (this.codeCanvas.clientWidth - this.state.left) / roomWidth
          ),
          this.state.maxIndX + 1
        ),
        this.maxBlockCount
      ),
    })
  }

  render() {
    let lineNumbers = [],
      blockAlphabets = [],
      blockHome = []
    for (let i = 0; i < this.state.lineCount; i++) {
      // Key - 'line 17'
      lineNumbers.push(
        <LineNumberRoom
          key={'lineNumber ' + i}
          num={i}
          style={this.state.lineStyles[i]}
        />
      )
      for (let j = 0; j < this.state.blockCount; j++) {
        // Key - 'block 2 17' (line 2, column 17)
        blockHome.push(<BlockRoom key={'block ' + i + ' ' + j} y={i} x={j} />)
      }
    }
    for (let j = 0; j < this.state.blockCount; j++) {
      blockAlphabets.push(
        <BlockAlphabetRoom key={'blockNumber ' + j} num={j} />
      )
    }

    return (
      <div ref={e => (this.codeCanvas = e)} className="codeCanvas grab">
        {/* blockHome */}
        <div ref={e => (this.blockHome = e)} className="blockHome">
          {blockHome}
          <div
            className={
              Object.keys(this.state.blocks).length === 0
                ? 'visible'
                : 'invisible'
            }
          >
            <img src={DoubleClick} alt="Double Click" />
            <p>Double click to add a block</p>
          </div>
          <CodeBlocks data={this.state.blocks} />
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
