import { Component, PureComponent } from 'react'
import equal from 'react-fast-compare'

import { LineNumberRoom, BlockAlphabetRoom, BlockRoom } from './codeCanvasFrags'
import DoubleClick from '../../img/icons/dclick.svg'

export class CanvasGrid extends Component {
  shouldComponentUpdate(nextProps) {
    return !equal(nextProps, this.props)
  }

  render() {
    const blockHome = []

    const {
      hasBlock,
      lineStartCount,
      blockStartCount,
      lineCount,
      blockCount,
      getRoomBackground,
    } = this.props

    for (let i = lineStartCount; i < lineCount; i++) {
      for (let j = blockStartCount; j < blockCount; j++) {
        // Key - '2blockRoom17' (line 2, column 17)
        blockHome.push(
          <BlockRoom
            key={i + 'blockRoom' + j}
            y={i}
            x={j}
            bg={getRoomBackground(i, j)}
          />
        )
      }
    }

    return (
      // blockHome
      <>
        {blockHome}

        {/* Tips or codeBlocks */}
        {!hasBlock && (
          <div className="addBlockHint">
            <img src={DoubleClick} alt="Double Click" />
            <p>double click to add a block</p>
          </div>
        )}
      </>
    )
  }
}

export class CanvasAxis extends PureComponent {
  render() {
    const lineNumbers = [],
      blockAlphabets = []

    const {
      lineCount,
      blockCount,
      blockAlphabetsRef,
      lineNumbersRef,
    } = this.props

    for (let i = 0; i < lineCount; i++)
      // Key - 'line17'
      lineNumbers.push(<LineNumberRoom key={'lineNumber' + i} num={i} />)

    for (let j = 0; j < blockCount; j++)
      blockAlphabets.push(<BlockAlphabetRoom key={'blockNumber' + j} num={j} />)

    return (
      <>
        {/* blockAlphabets */}
        <div ref={blockAlphabetsRef} className="blockAlphabets">
          {blockAlphabets}
        </div>
        {/* lineNumbers */}
        <div ref={lineNumbersRef} className="lineNumbers">
          {lineNumbers}
        </div>
        {/* lineJoint */}
        <div className="lineJoint"></div>
      </>
    )
  }
}
