import { memo } from 'react'

import Node from '../node.js'
import { _getParentBlockInBook } from '../frags.js'
import { getOutputConnectType } from '../blockRendererMethod.js'

const InlineBlock = memo(
  ({
    className,
    text,
    input, // For node rendering
    output,
    inputNodes, // For node text rendering
    outputNodes,
    inputBlocks,
    type,
    x,
    y,
    nodesRef,
    focused,
    selectedNodes,
    name,
    description,
  }) => {
    let inlineInputNodes = []
    if (inputNodes)
      for (let i in inputNodes)
        inlineInputNodes.push(
          <Node
            key={x + y + ' inputNode' + i}
            nodeClass="input"
            count={inputNodes.length}
            type={type}
            connectType={
              input[i] !== null
                ? _getParentBlockInBook(inputBlocks[i])
                  ? _getParentBlockInBook(inputBlocks[i]).outputNodes[
                      input[i][2]
                    ].type[0]
                  : null
                : null
            }
            // If connectType !== null, then connected
            ref={nodesRef.input[i]}
            focused={focused}
            selected={selectedNodes.input.includes(i)}
            name={name}
            nodeType={'inputNodes'}
            hintRefPosition={i}
          />
        )
    return (
      <div className={className} data-hints={`${name} block`}>
        {inputNodes && (
          <>
            <div
              className={
                'nodes inputNodes inlineInputCount' + inputNodes.length
              }
            >
              {inlineInputNodes}
            </div>

            {inputNodes.length > 1 && (
              // 2 input nodes
              <div className="nodesText inlineText">
                <p className="inlineTextLeft nodeText">{inputNodes[0].text}</p>
                <p className="inlineTextRight nodeText">{inputNodes[1].text}</p>
              </div>
            )}
          </>
        )}

        <div className="blockName">{text}</div>

        {outputNodes && (
          <div className={'nodes outputNodes inlineOutputCount1'}>
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
)

export default InlineBlock
