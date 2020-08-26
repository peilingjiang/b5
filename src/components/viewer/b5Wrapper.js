import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'
import p5 from 'p5'

import b5 from '../../b5.js/src/app.js'

export default class B5Wrapper extends Component {
  constructor(props) {
    super(props)
    this.viewerCanvas = createRef()
    this.b = new b5()

    this.myP5 = null
  }

  Sketch = p => {
    p.setup = () => {
      this.b.runSetup(p) // Run Factory blocks
    }

    p.draw = () => {
      this.b.runDraw(p) // Run Playground blocks
    }
  }

  componentDidMount() {
    this._updateB5()
    if (this.myP5 === null) this._initCanvas()
  }

  componentDidUpdate(prevProps) {
    this._updateB5()
    if (
      !equal(prevProps.data.factory, this.props.data.factory) &&
      Object.keys(prevProps.data).length !== 0 // Avoid creating two canvas at first
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
    return !equal(nextProps.data, this.props.data)
  }

  _initCanvas = () => {
    // Init canvas
    this._clearCanvas() // Always clear the old one first
    this.myP5 = new p5(this.Sketch, this.viewerCanvas.current)
  }

  _clearCanvas = () => {
    if (this.myP5 !== null) this.myP5.remove()
  }

  _updateB5 = () => {
    // Ignore initial rendering when data is {}
    if (Object.keys(this.props.data).length !== 0) {
      this.b.update(this.props.data)
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
