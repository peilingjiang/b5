import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'
import p5 from 'p5'

export default class B5Wrapper extends Component {
  // props - Readily available b5 object
  constructor(props) {
    super(props)
    this.viewerCanvas = createRef()

    this.myP5 = null
  }

  Sketch = p => {
    let loop = true

    p.setup = () => {
      if (this.props.b.runSetup) this.props.b.runSetup(p)
      else loop = false
    }

    p.draw = () => {
      if (loop) this.props.b.runDraw(p) // Run Playground blocks
    }
  }

  componentDidMount() {
    if (this.myP5 === null) this._initCanvas()
  }

  componentDidUpdate(prevProps) {
    if (
      !equal(prevProps.b.factory, this.props.b.factory) &&
      Object.keys(prevProps.b).length !== 0 // Avoid creating two canvas at first
    )
      // Factory data changed, canvas needs to be re-created
      this._initCanvas()
  }

  componentWillUnmount() {
    // Remove the previous canvas
    this._clearCanvas()
  }

  shouldComponentUpdate(nextProps) {
    // Only re-render when data changes
    return !equal(nextProps.b, this.props.b)
  }

  _initCanvas = () => {
    // Init canvas
    this._clearCanvas() // Always clear the old one first
    this.myP5 = new p5(this.Sketch, this.viewerCanvas.current)
  }

  _clearCanvas = () => {
    if (this.myP5 !== null) {
      // Remove canvas
      this.myP5.remove()
      delete this.myP5
      this.myP5 = null
      // Unplug section blocks output data
      this.props.b.unplug()
    }
  }

  render() {
    return (
      <div id="viewerCanvas" ref={this.viewerCanvas}>
        {/* ... id="defaultCanvas0" class="p5Canvas" */}
      </div>
    )
  }
}
