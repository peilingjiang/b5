import React, { PureComponent, createRef } from 'react'
import p5 from 'p5'

// import b5 from '../../b5.js/src/b5'

export default class B5Wrapper extends PureComponent {
  constructor(props) {
    super(props)
    this.viewerCanvas = createRef()
  }

  Sketch = p => {
    // const b = new b5(this.props.data)

    p.setup = () => {
      p.createCanvas(500, 300)
      p.background('#fff')
    }

    p.draw = () => {
      p.noLoop()
    }
  }

  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.viewerCanvas.current)
  }

  render() {
    return (
      <div id="viewerCanvas" ref={this.viewerCanvas}>
        {/* ... id="defaultCanvas0" class="p5Canvas" */}
      </div>
    )
  }
}
