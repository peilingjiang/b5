import React, { Component, createRef } from 'react'

import '../../postcss/components/blockRenderer/blockRenderer.css'
import { lineHeight, roomWidth } from '../constants'
import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'
import { Node } from './frags'
import { InputBlock, SliderBlock } from './special'

function _getTotalOffset(thisNode, targetClassName) {
  // [x, y]
  if (thisNode.classList.contains(targetClassName))
    return [thisNode.offsetLeft, thisNode.offsetTop]

  const total = _getTotalOffset(thisNode.parentNode, targetClassName)

  return [thisNode.offsetLeft + total[0], thisNode.offsetTop + total[1]]
}

class BlockRenderer extends Component {
  constructor(props) {
    super(props) // x, y, data, inputBlocks
    this.x = props.x
    this.y = props.y

    /*

    > this.props.inputBlocks
    {
      '0': 'number',
      '1': 'numberSlider',
    }

    */

    const {
      data: { input, output },
    } = this.props
    this.inputNum = input ? Object.keys(input).length : 0
    this.outputNum = output ? Object.keys(output).length : 0

    this.nodesRef = {
      input: [],
      output: [],
    }

    for (let i = 0; i < this.inputNum; i++)
      this.nodesRef.input.push(createRef())
    for (let i = 0; i < this.outputNum; i++)
      this.nodesRef.output.push(createRef())
  }

  componentDidMount() {
    // Handle collect init positions of nodes
    this.handleCollectNodesOffset()
  }

  componentWillUnmount() {
    // Handle delete node offset data of this position
    // this.handleDeleteNodesOffset()
  }

  componentDidUpdate() {
    this.handleCollectNodesOffset()
  }

  shouldComponentUpdate(prevProps) {
    return prevProps.data !== this.props.data
  }

  handleCollectNodesOffset = () => {
    let data = {
      input: [],
      output: [],
    }
    for (let i = 0; i < this.inputNum; i++)
      data.input.push(
        _getTotalOffset(this.nodesRef.input[i].current, 'blockFill')
      )
    for (let i = 0; i < this.outputNum; i++)
      data.output.push(
        _getTotalOffset(this.nodesRef.output[i].current, 'blockFill')
      )

    this.props.collectNodesOffset(this.props.x, this.props.y, data)
  }

  handleDeleteNodesOffset = () => {
    this.props.deleteNodesOffset(this.props.x, this.props.y)
  }

  render() {
    const {
        data: { name, input, inlineData, output },
        inputBlocks,
        x,
        y,
        collect,
      } = this.props,
      { type, kind, inputNodes, outputNodes } = _b5BlocksObject[name]

    let blockInputNodes = [],
      blockOutputNodes = [],
      inputNodesText = [],
      outputNodesText = []

    let inputNodesCount = 0,
      outputNodesCount = 0

    if (inputNodes !== null) {
      inputNodesCount = inputNodes.length
      for (let i in inputNodes) {
        blockInputNodes.push(
          <Node
            key={x + y + ' inputNode' + i}
            nodeClass="input"
            count={inputNodesCount}
            type={type}
            connectType={
              input[i] !== null
                ? _b5BlocksObject[inputBlocks[i]].outputNodes[input[i][2]]
                    .type[0]
                : null
            }
            // If connectType !== null, then connected
            ref={this.nodesRef.input[i]}
          />
        )
        inputNodesText.push(
          <p
            key={x + y + ' inputText' + i}
            className={'inputText count' + inputNodesCount}
          >
            {inputNodes[i].text}
          </p>
        )
      }
    }

    if (outputNodes !== null) {
      outputNodesCount = outputNodes.length
      for (let i in outputNodes) {
        blockOutputNodes.push(
          <Node
            key={x + y + 'outputNode ' + i}
            nodeClass="output"
            count={outputNodesCount}
            type={type}
            connectType={output[i].length !== 0 ? outputNodes[i].type[0] : null} // output can only be [] (when not connected) instead of null
            ref={this.nodesRef.output[i]}
          />
        )
        outputNodesText.push(
          <p
            key={x + y + 'outputText ' + i}
            className={'outputText count' + outputNodesCount}
          >
            {outputNodes[i].text}
          </p>
        )
      }
    }

    return (
      <div
        className="blockFill"
        style={{
          top: this.y * lineHeight + 'px',
          left: this.x * roomWidth + 'px',
        }}
        ref={this.props.thisBlockRef}
      >
        {kind === 'inline' ? (
          <></>
        ) : kind === 'method' ? (
          <></>
        ) : kind === 'display' ? (
          <></>
        ) : kind === 'input' ? (
          <InputBlock
            className={'grab block ' + type + ' ' + kind}
            name={name}
            inlineData={inlineData}
            output={output}
            outputNodes={outputNodes}
            type={type}
            collect={collect}
            x={x}
            y={y}
            nodesRef={this.nodesRef}
          />
        ) : kind === 'slider' ? (
          <SliderBlock
            className={'grab block ' + type + ' ' + kind}
            name={name}
            inlineData={inlineData}
            output={output}
            outputNodes={outputNodes}
            type={type}
            collect={collect}
            x={x}
            y={y}
            nodesRef={this.nodesRef}
          />
        ) : (
          // kind === 'normal'
          <div
            className={
              'grab block ' +
              type +
              ' ' +
              kind +
              ' nodesCount' +
              Math.max(inputNodesCount, outputNodesCount)
            }
          >
            {inputNodes !== null ? (
              <>
                <div className="nodes inputNodes">{blockInputNodes}</div>
                <div className="nodesText inputNodesText">{inputNodesText}</div>
              </>
            ) : null}

            <div className="blockName">{name}</div>

            {outputNodes !== null ? (
              <>
                <div className="nodesText outputNodesText">
                  {outputNodesText}
                </div>
                <div className="nodes outputNodes">{blockOutputNodes}</div>
              </>
            ) : null}
          </div>
        )}
      </div>
    )
  }
}

export default BlockRenderer
