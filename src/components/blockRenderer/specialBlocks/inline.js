import React, { memo } from 'react'

import Node from '../node'
import { _getParentBlockInBook } from '../frags'

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
            hintName={inputNodes[i].name}
            hintDescription={inputNodes[i].description}
            hintType={inputNodes[i].type[0]}
          />
        )
    return (
      <div
        className={className}
        data-hint={true}
        data-hint-name={name}
        data-hint-description={description}
        data-hint-type={type}
        data-hint-category={'block'}
      >
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
              connectType={
                output[0].length !== 0 ? outputNodes[0].type[0] : null
              }
              ref={nodesRef.output[0]}
              focused={focused}
              selected={selectedNodes.output.includes('0')}
              hintName={outputNodes[0].name}
              hintDescription={outputNodes[0].description}
              hintType={outputNodes[0].type[0]}
              hintSide={'down'}
            />
          </div>
        )}
      </div>
    )
  }
)

export default InlineBlock
