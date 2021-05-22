import { Component } from 'react'
import equal from 'react-fast-compare'

import CodeCanvas from '../codeCanvas/codeCanvas'

export default class Playground extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      !equal(nextProps.data, this.props.data) ||
      !equal(nextProps.canvasStyle, this.props.canvasStyle) ||
      !equal(
        nextProps.playgroundCodeCanvasRef,
        this.props.playgroundCodeCanvasRef
      )
    )
  }

  render() {
    const { collect, collectStyle, playgroundCodeCanvasRef, hardRefresh } =
      this.props
    return (
      <div id="playground">
        <CodeCanvas
          maxLineCount={199}
          maxBlockCount={12}
          data={this.props.data}
          canvasStyle={this.props.canvasStyle}
          collect={collect}
          collectStyle={collectStyle}
          thisCodeCanvasRef={playgroundCodeCanvasRef}
          hardRefresh={hardRefresh}
          canvasId={'playgroundCodeCanvas'}
        />
        {/* <div className="shadow"></div> */}
      </div>
    )
  }
}
