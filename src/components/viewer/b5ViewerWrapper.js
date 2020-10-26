import React, { Component } from 'react'
import equal from 'react-fast-compare'
import p5 from 'p5'

import _b from '../editor/b5ObjectWrapper'

export default class B5Wrapper extends Component {
  // props - Readily available b5 object
  constructor(props) {
    super(props)
    this.myP5 = null
  }

  Sketch = p => {
    let loop = true

    p.setup = () => {
      if (_b.runSetup) _b.runSetup(p)
      else loop = false
    }

    p.draw = () => {
      p.push()
      if (loop) _b.runDraw(p) // Run Playground blocks
      p.pop()
    }
  }

  componentDidMount() {
    if (this.myP5 === null) this._initCanvas()
  }

  componentDidUpdate() {
    this._initCanvas()
  }

  componentWillUnmount() {
    // Remove the previous canvas
    this._clearCanvas()
  }

  shouldComponentUpdate(nextProps) {
    // Only re-render when data changes
    if (this.props.data.factory)
      // Only initCanvas when variable data changed
      return !equal(
        nextProps.data.factory.variable,
        this.props.data.factory.variable
      )
    return false
  }

  _initCanvas = () => {
    // Init canvas
    this._clearCanvas() // Always clear the old one first
    this.myP5 = new p5(this.Sketch, this.props.canvasRef.current)
  }

  _clearCanvas = () => {
    if (this.myP5 !== null) {
      // Unplug section blocks output data
      _b.unplug()
      // Remove canvas
      this.myP5.remove()
      delete this.myP5
      this.myP5 = null
    }
  }

  render() {
    return (
      <div
        id="viewerCanvas"
        className="viewerCanvas"
        ref={this.props.canvasRef}
      >
        {/* ... id="defaultCanvas0" class="p5Canvas" */}
      </div>
    )
  }
}
