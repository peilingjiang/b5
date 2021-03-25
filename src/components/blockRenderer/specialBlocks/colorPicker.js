import { Component } from 'react'

import _b5BlocksObject from '../../../b5.js/src/blocks/blocksObjectWrapper'
import Node from '../node'
import { ColorPickerEntry } from '../frags'
import { getRGBAFromHex, isLight } from '../blockRendererMethod'

export default class ColorPickerBlock extends Component {
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
      scale,
    } = this.props
    const rgba = getRGBAFromHex(inlineData[0])

    return (
      <div
        className={className + (isLight(inlineData[0]) ? ' blockTooLight' : '')}
        style={{
          backgroundColor: inlineData[0],
          boxShadow: focused
            ? `0 2px 11px -2px rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0.8)`
            : 'none',
        }}
        data-hints={`${name} block`}
      >
        {name === 'strokePicker' && <div className="strokeMaskDiv"></div>}
        {output && (
          <div className="nodes outputNodes">
            <Node
              nodeClass="output"
              count={1}
              type={type}
              connectType={
                output[0].length !== 0 ? outputNodes[0].type[0] : null
              }
              ref={nodesRef.output[0]}
              focused={focused}
              selected={selectedNodes.output.includes('0')}
              name={name}
              nodeType={'outputNodes'}
              refPosition={0}
              hintSide={'down'}
            />
          </div>
        )}

        <ColorPickerEntry
          action={action}
          thisInlineData={inlineData[0]}
          thisDataType={_b5BlocksObject.original[name].inlineData[0].type[1]}
          inlineDataInd={0}
          scale={scale}
          name={name}
          text={text} // Difference from InputBox
          x={x}
          y={y}
          collect={collect}
        />
        {name === 'strokePicker' && isLight(inlineData[0]) && (
          <div className="strokeMaskDivTooLight"></div>
        )}
      </div>
    )
  }
}
