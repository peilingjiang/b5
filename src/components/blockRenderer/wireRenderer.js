import React, { Component, PureComponent } from 'react'
import equal from 'react-fast-compare'

import { nodeSize, sizeOffset, dragOvalSize } from '../constants'
import '../../postcss/components/blockRenderer/wireRenderer.css'

const _dragOvalR = dragOvalSize / 2

class Wire extends PureComponent {
  render() {
    const {
      start: [x1, y1],
      end: [x2, y2],
      focused,
      selected,
      dragged,
      inputNode,
    } = this.props

    const inputNodeData = inputNode
      ? {
          'data-y': inputNode[0],
          'data-x': inputNode[1],
          'data-node': inputNode[2],
        }
      : null

    const midY = (y2 - y1) * 0.6 // To get the mid point, divide by 2
    const canvasLeft = Math.min(x1, x2) - sizeOffset - dragOvalSize
    const canvasTop = Math.min(y1, y2) - dragOvalSize

    const d = `
      M ${x1 - canvasLeft} ${y1 + sizeOffset - canvasTop}
      C ${x1 - canvasLeft} ${y1 + midY - canvasTop},
        ${x2 - canvasLeft} ${y2 - midY - canvasTop},
        ${x2 - canvasLeft} ${y2 + sizeOffset - canvasTop}
    `
    // sizeOffset is half of the nodeSize

    return (
      <div
        className="svg"
        style={{ left: canvasLeft + 'px', top: canvasTop + 'px' }}
      >
        <svg
          width={`${Math.abs(x1 - x2) + nodeSize + 2 * dragOvalSize}px`}
          height={`${Math.abs(y1 - y2) + nodeSize + 2 * dragOvalSize}px`}
          className={'wireHolder' + (selected ? ' selected' : '')}
        >
          {/* Only show background when not selected */}
          {!selected && (
            <path className="wireBackground pointer" d={d} {...inputNodeData} />
          )}

          {/* Main wire */}
          <path
            className={
              'wire pointer' +
              (focused ? ' focused' : ' unfocused') +
              (selected ? ' selected' : '')
            }
            d={d}
            {...inputNodeData}
          />
        </svg>

        {/* Dragging point oval, only when dragged */}
        {dragged && (
          <svg width="100%" height="100%" className="dragOvalHolder">
            <circle
              cx={x2 - canvasLeft}
              cy={y2 + sizeOffset - canvasTop}
              r={_dragOvalR}
              className="dragOval"
            />
          </svg>
        )}
      </div>
    )
  }
}

export default class WireRenderer extends Component {
  shouldComponentUpdate(nextProps) {
    return !equal(nextProps, this.props)
  }

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

  _isSelected = (y, x, node) => {
    const s = this.props.selectedWire
    const thisNode = [y, x, node]

    for (let i in s) if (equal(s[i], thisNode)) return true
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
                  selected={this._isSelected(i, j, node)}
                  dragged={false}
                  inputNode={[i, j, node]} // For wire selection
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
          selected={false}
          dragged={true} // Draw a highlight circle at the dragging point
          inputNode={null}
        />
      )

    return <div className="wires">{wires}</div>
  }
}
