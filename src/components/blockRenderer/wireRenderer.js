import React, { Component, PureComponent } from 'react'

import { nodeSize, sizeOffset } from '../constants'

class Wire extends PureComponent {
  render() {
    const {
      start: [x1, y1],
      end: [x2, y2],
      focused,
    } = this.props

    const midY = (y2 - y1) * 0.6 // To get the mid point, divide by 2
    const canvasLeft = Math.min(x1, x2) - sizeOffset
    const canvasTop = Math.min(y1, y2)

    const d = `
      M ${x1 - canvasLeft} ${y1 + sizeOffset - canvasTop}
      C ${x1 - canvasLeft} ${y1 + midY - canvasTop},
        ${x2 - canvasLeft} ${y2 - midY - canvasTop},
        ${x2 - canvasLeft} ${y2 + sizeOffset - canvasTop}
    `

    return (
      <div
        className="svg"
        style={{ left: canvasLeft + 'px', top: canvasTop + 'px' }}
      >
        <svg
          // className="selected"
          width={`${Math.abs(x1 - x2) + nodeSize}px`}
          height={`${Math.abs(y1 - y2) + nodeSize}px`}
          className="wireHolder"
        >
          <path className="wireBackground pointer" d={d} />
          <path
            className={'wire pointer ' + (focused ? 'focused' : 'unfocused')}
            d={d}
          />
        </svg>
      </div>
    )
  }
}

export default class WireRenderer extends Component {
  _isFocused = (y1, x1, y2, x2) => {
    const f = this.props.focused

    for (let i in f)
      if (
        (f[i][0] === y1 && f[i][1] === x1) ||
        (f[i][0] === y2 && f[i][1] === x2)
      )
        return true
    return false
  }

  render() {
    // Wires are **always** drawn from input to the parent's output
    const { data, nodesOffset, draggingWire } = this.props

    let wires = []

    for (let i in nodesOffset) // y from input node
      for (let j in nodesOffset[i]) // x from input node
        for (let node in nodesOffset[i][j].input)
          if (data[i] && data[i][j] && data[i][j].input[node] !== null) {
            // TODO: How can we remove the safe check (data[i] && data[i][j])? (mainly for deleteBlock task)
            const c = data[i][j].input[node] // Connected output node, [1, 2, 1]
            if (nodesOffset[c[0]] && nodesOffset[c[0]][c[1]])
              wires.push(
                <Wire
                  key={'wire ' + i + j + node + c[0] + c[1] + c[2]}
                  start={nodesOffset[i][j].input[node]} // [141, 195]
                  end={nodesOffset[c[0]][c[1]].output[c[2]]}
                  focused={this._isFocused(i, j, c[0], c[1])}
                />
              )
          }

    // Render temp wire if trying to add new connection
    if (draggingWire)
      wires.push(
        <Wire
          key={'tempWire'}
          start={draggingWire.start}
          end={draggingWire.end}
          focused={true}
        />
      )

    return <div className="wires">{wires}</div>
  }
}
