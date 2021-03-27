import { Component } from 'react'

import _b5BlocksObject from '../../../b5.js/src/blocks/blocksObjectWrapper'
import Node from '../node'
import { InputBox } from '../frags'
import { getOutputConnectType } from '../blockRendererMethod'

export default class InputBlock extends Component {
  render() {
    const {
      action,
      className,
      name,
      text,
      type,
      x,
      y,
      inlineData,
      output,
      outputNodes,
      collect,
      nodesRef,
      focused,
      selectedNodes,
    } = this.props
    return (
      // * string input block is specially long...
      <div
        className={className + (text === 'str' ? ' longInputWidth' : '')}
        data-hints={`${name} block`}
      >
        {/* <div className="blockName">{text}</div> */}
        <InputBox
          action={action}
          className={''}
          thisInlineData={inlineData[0]}
          thisDataType={_b5BlocksObject.original[name].inlineData[0].type[1]}
          inlineDataInd={0}
          name={name}
          x={x}
          y={y}
          collect={collect}
          hintRefPosition={0}
        />
        <p className="nodeText bottomText">{text}</p>
        {output && (
          <div className="nodes outputNodes">
            <Node
              nodeClass="output"
              count={1}
              type={type}
              connectType={getOutputConnectType(output, outputNodes, 0)}
              ref={nodesRef.output[0]}
              focused={focused}
              selected={selectedNodes.output.includes('0')}
              name={name}
              nodeType={'outputNodes'}
              hintRefPosition={0}
              hintSide={'down'}
            />
          </div>
        )}
      </div>
    )
  }
}
