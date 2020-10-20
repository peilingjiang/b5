import React, { Component, PureComponent } from 'react'
import equal from 'react-fast-compare'

import { nodeSize, sizeOffset, dragOvalSize } from '../constants'
import '../../postcss/components/blockRenderer/wireRenderer.css'

const _dragOvalR = dragOvalSize / 2

class Wire extends PureComponent {
  render() {
    const { focused, selected, dragged, inputNode } = this.props

    let { startX, startY, endX, endY } = this.props

    let inputNodeArray = inputNode ? inputNode.split(' ') : null

    const inputNodeData = inputNodeArray
      ? {
          'data-y': inputNodeArray[0],
          'data-x': inputNodeArray[1],
          'data-node': inputNodeArray[2],
        }
      : null

    const canvasLeft = Math.min(startX, endX) - sizeOffset - _dragOvalR
    const canvasTop = Math.min(startY, endY) - _dragOvalR

    startX = startX - canvasLeft
    endX = endX - canvasLeft
    startY = startY - canvasTop + sizeOffset
    endY = endY - canvasTop + sizeOffset
    // To get the mid point, divide by 2
    const factor = Math.abs(startX - endX) > 50 ? 2 : 2.5
    const yOffset = (endY - startY) / factor

    const d = `
      M ${startX} ${startY}
      C ${startX} ${startY + yOffset},
        ${endX} ${endY - yOffset},
        ${endX} ${endY}
    `

    // sizeOffset is half of the nodeSize
    return (
      <div
        className="svg"
        style={{ left: canvasLeft + 'px', top: canvasTop + 'px' }}
      >
        <svg
          width={`${Math.abs(startX - endX) + nodeSize + dragOvalSize}px`}
          height={`${Math.abs(startY - endY) + nodeSize + dragOvalSize}px`}
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
            <circle cx={endX} cy={endY} r={_dragOvalR} className="dragOval" />
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

  _isFocused = (node1, node2) => {
    // node1 === [y1, x1]
    // node2 === [y2, x2]
    const f = this.props.focused

    for (let i in f) if (equal(node1, f[i]) || equal(node2, f[i])) return true
    return false
  }

  _isSelected = thisNode => {
    const s = this.props.selectedWire
    // const thisNode = [y, x, node]

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
          if (
            data[i] &&
            data[i][j] &&
            data[i][j].input &&
            data[i][j].input[node]
          ) {
            // TODO: How can we remove the safe check (data[i] && data[i][j])? (mainly for deleteBlock task)
            const c = data[i][j].input[node] // Connected output node, [1, 2, 1]
            if (
              nodesOffset[c[0]] &&
              nodesOffset[c[0]][c[1]] &&
              nodesOffset[c[0]][c[1]].output[c[2]]
            ) {
              const s = nodesOffset[i][j].input[node]
              const e = nodesOffset[c[0]][c[1]].output[c[2]]
              wires.push(
                <Wire
                  key={'wire ' + i + j + node + c[0] + c[1] + c[2]}
                  startX={s[0]} // [141, 195]
                  startY={s[1]}
                  endX={e[0]}
                  endY={e[1]}
                  focused={this._isFocused([i, j], [c[0], c[1]])}
                  selected={this._isSelected([i, j, node])}
                  dragged={false}
                  inputNode={i + ' ' + j + ' ' + node} // For wire selection
                />
              )
            }
          }

    // Render temp wire if trying to add new connection
    if (draggingWire)
      wires.push(
        <Wire
          key={'tempWire'}
          startX={draggingWire.start[0]}
          startY={draggingWire.start[1]}
          endX={draggingWire.end[0]}
          endY={draggingWire.end[1]}
          focused={true}
          selected={false}
          dragged={true} // Draw a highlight circle at the dragging point
          inputNode={null}
        />
      )

    return <div className="wires">{wires}</div>
  }
}
