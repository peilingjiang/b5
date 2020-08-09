import React, { Component } from 'react'

import CodeCanvas from '../codeCanvas/codeCanvas'

export default class Playground extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props
  }

  render() {
    const { collect, collectStyle } = this.props
    return (
      <div id="playground">
        <CodeCanvas
          maxLineCount={199}
          maxBlockCount={9}
          data={this.props.data}
          canvasStyle={this.props.canvasStyle}
          collect={collect}
          collectStyle={collectStyle}
        />
        <div className="shadow"></div>
      </div>
    )
  }
}
