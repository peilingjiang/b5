import React, { Component, createRef } from 'react'
import p5 from 'p5'

import b5 from '../../b5.js/src/app'

export default class B5Wrapper extends Component {
  constructor(props) {
    super(props)
    this.viewerCanvas = createRef()
  }

  Sketch = p => {
    const b = new b5(this.props.data)

    p.setup = () => {
      b.runSetup(p) // Run Factory blocks
    }

    p.draw = () => {
      b.runDraw(p) // Run Playground blocks
    }
  }

  _initCanvas() {
    const viewerCanvasCurrent = this.viewerCanvas.current

    // Remove the previous canvas
    while (viewerCanvasCurrent.firstChild)
      viewerCanvasCurrent.removeChild(viewerCanvasCurrent.firstChild)

    this.myP5 = new p5(this.Sketch, viewerCanvasCurrent)
  }

  componentDidMount() {
    // Ignore initial rendering when data is {}
    if (Object.keys(this.props.data).length !== 0) this._initCanvas()
  }

  componentDidUpdate(prevProps) {
    // Only re-render when data changes
    // TODO: Only update b instead of re-render the whole canvas
    if (prevProps.data !== this.props.data) this._initCanvas()
  }

  render() {
    return (
      <div id="viewerCanvas" ref={this.viewerCanvas}>
        {/* ... id="defaultCanvas0" class="p5Canvas" */}
      </div>
    )
  }
}
