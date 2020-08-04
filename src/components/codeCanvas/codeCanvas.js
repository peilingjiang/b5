import React, { Component } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  lineHeight,
  roomWidth,
  lineNumberWidth,
  maxLineCountAllowed,
  maxBlockCountAllowed,
} from './constants'
import { LineNumberRoom, BlockRoom } from './codeCanvasFrag'
import '../../postcss/components/codeCanvas/codeCanvas.css'

class Room {
  constructor() {
    this.roomId = uuidv4()
    this.block = null
    this.style = {}
  }
}

export class CodeCanvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lineCount: 1, // # of lines
      blockCount: 1, // # of block rooms for each line
      left: 0, // Left offset (codeCanvas) after dragging
      top: 0, // Top offset (codeCanvas) after dragging
      scale: 1, // codeCanvas scale
      maxIndX: 0, // Max index (with block in the room) on x-axis (horizontally)
      maxIndY: 0, // Max index (with block in the room) on y-axis (vertically)
      lines: [[new Room()]], // Array of arrays of Room objects
    }
  }

  componentDidMount() {
    this.refreshCanvasLines()
    this.codeCanvas.addEventListener('mousedown', this.handlePan, true)
    this.codeCanvas.addEventListener('wheel', this.handleZoom, true)
  }

  componentWillUnmount() {
    this.codeCanvas.removeEventListener('mousedown', this.handlePan, true)
    this.codeCanvas.removeEventListener('wheel', this.handleZoom, true)
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
      that.setState({
        left: parseInt(
          (that.blockHome.style.left =
            Math.max(
              Math.min(mouse.homeLeft + delta.x, lineNumberWidth),
              -maxBlockCountAllowed * roomWidth +
                that.codeCanvas.offsetWidth -
                17
            ) + 'px').replace('px', '')
        ),
        top: parseInt(
          (that.lineNumbers.style.top = that.blockHome.style.top =
            Math.max(
              Math.min(mouse.homeTop + delta.y, 0),
              -maxLineCountAllowed * lineHeight +
                that.codeCanvas.offsetHeight -
                17
            ) + 'px').replace('px', '')
        ),
      })
    }

    this.codeCanvas.addEventListener('mousemove', grabCanvas, true)
    console.log(this.state.left)

    document.addEventListener(
      'mouseup',
      function _listener() {
        that.codeCanvas.className = 'codeCanvas grab'
        that.codeCanvas.removeEventListener('mousemove', grabCanvas, true)
        that.refreshCanvasLines()
        document.removeEventListener('mouseup', _listener, true)
      },
      true
    )
  }

  handleZoom = e => {
    e.preventDefault()
    // TODO: Update position constrains on zoom
    this.setState({
      scale:
        Math.round(
          Math.min(Math.max(this.state.scale + e.deltaY * 0.001, 0.6), 1.1) *
            1000
        ) / 1000,
    })
    this.codeCanvas.style.transform = 'scale(' + this.state.scale + ')'
    this.codeCanvas.style.width = 100 / this.state.scale + '%'
    this.codeCanvas.style.height = 100 / this.state.scale + '%'
    this.refreshCanvasLines()
  }

  handleResize = e => {
    console.log('Resized')
  }

  _getSeclusionInd() {
    // Get the indices for furthest blocks in codeCanvas
    // Update only on block changes

    // Vertical Search - y
    let maxIndV = 0
    searchY: for (let i = this.state.lineCount - 1; i >= 0; i--)
      for (let j in this.state.lines[i])
        if (this.state.lines[i][j].block) {
          maxIndV = i // Line
          break searchY
        }
    // Horizontal Search - x
    let maxIndH = 0
    for (let i = 0; i < this.state.lineCount; i++)
      for (let j in this.state.lines[i])
        if (this.state.lines[i][j].block && j > maxIndH) maxIndH = j // Block

    this.setState({
      maxIndY: maxIndV,
      maxIndX: maxIndH,
    })
  }

  async refreshCanvasLines() {
    let targetLineCount = Math.min(
        Math.max(
          Math.ceil(
            (this.codeCanvas.clientHeight - this.state.top) / lineHeight
          ),
          this.state.maxIndY
        ),
        maxLineCountAllowed
      ),
      targetBlockCount = Math.min(
        Math.max(
          Math.ceil(
            (this.codeCanvas.clientWidth - this.state.left) / roomWidth
          ),
          this.state.maxIndX
        ),
        maxBlockCountAllowed
      )
    // Construct new lines and blocks
    if (
      this.state.lineCount !== targetLineCount ||
      this.state.blockCount !== targetBlockCount
    ) {
      // Update lines arrays
      this.setState(prevState => {
        let newLines = []
        for (let l = 0; l < targetLineCount; l++) {
          newLines.push([]) // Set new empty line
          if (l < this.state.lineCount)
            for (let b = 0; b < targetBlockCount; b++)
              newLines[l].push(prevState.lines[l][b] || new Room())
          // Add from prevLines or create new rooms
          // New lines
          else
            for (let b = 0; b < targetBlockCount; b++)
              newLines[l].push(new Room())
        }
        return { lines: newLines }
      })

      // Update counts
      this.setState({
        lineCount: targetLineCount,
        blockCount: targetBlockCount,
      })
    }
  }

  render() {
    let lineNumbers = this.state.lines.map((l, ind) => {
      return <LineNumberRoom key={ind} num={ind} />
    })
    let blockHome = this.state.lines.map((l, ind) => {
      return l.map((b, i) => {
        return <BlockRoom key={b.roomId} x={i} y={ind} />
      })
    })
    return (
      <div ref={e => (this.codeCanvas = e)} className="codeCanvas grab">
        <div ref={e => (this.blockHome = e)} className="blockHome">
          {blockHome}
        </div>
        <div ref={e => (this.lineNumbers = e)} className="lineNumbers">
          {lineNumbers}
        </div>
      </div>
    )
  }
}
