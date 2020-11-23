import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

import { lineHeight, roomWidth } from '../constants'
import Node from './node'
import { _getParentBlockInBook } from './frags'
import { checkSectionNameNotValid } from '../factory/factoryMethod'
import { InputBlock, SliderBlock } from './specialBlocks/special'
import ColorPickerBlock from './specialBlocks/colorPicker'
import InlineBlock from './specialBlocks/inline'
import CommentBlock from './specialBlocks/comment'
import '../../postcss/components/blockRenderer/css/blockRenderer.css'
import { _scaleSensitiveBlockKinds } from '../magicalIndex'

function _getTotalOffset(thisNode, targetClassName) {
  // [x, y]
  if (thisNode) {
    if (thisNode.classList.contains(targetClassName))
      return [thisNode.offsetLeft, thisNode.offsetTop]

    const total = _getTotalOffset(thisNode.parentNode, targetClassName)

    return [thisNode.offsetLeft + total[0], thisNode.offsetTop + total[1]]
  } else return [0, 0]
}

class BlockRenderer extends Component {
  // TODO: Using PropTypes?
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

    this.nodesRef = {
      input: [],
      output: [],
    }

    this._refreshInputNodesRef(input)
    this._refreshOutputNodesRef(output)

    // Kind of a block should never change
    this.kind = _b5BlocksObject[props.data.source][props.data.name].kind
  }

  componentDidMount() {
    // Handle collect init positions of nodes
    if (this.props.action) this.handleCollectNodesOffset(true)
  }

  componentDidUpdate() {
    if (this.props.action) this.handleCollectNodesOffset(true)
  }

  shouldComponentUpdate(nextProps) {
    if (!equal(nextProps.data.input, this.props.data.input))
      this._refreshInputNodesRef(nextProps.data.input)
    if (!equal(nextProps.data.output, this.props.data.output))
      this._refreshOutputNodesRef(nextProps.data.output)

    return (
      nextProps.liteRenderer || // Always re-render lite blocks
      !equal(nextProps.data, this.props.data) ||
      nextProps.focused !== this.props.focused ||
      !equal(nextProps.selectedNodes, this.props.selectedNodes) ||
      !equal(nextProps.isRenaming, this.props.isRenaming) ||
      (nextProps.scale !== this.props.scale &&
        // Block is sensitive to scale change
        _scaleSensitiveBlockKinds.includes(this.kind))
    )
  }

  _refreshInputNodesRef = input => {
    this.inputNum = input ? Object.keys(input).length : 0
    for (let i = 0; i < this.inputNum; i++)
      this.nodesRef.input.push(createRef())
  }

  _refreshOutputNodesRef = output => {
    this.outputNum = output ? Object.keys(output).length : 0
    for (let i = 0; i < this.outputNum; i++)
      this.nodesRef.output.push(createRef())
  }

  handleCollectNodesOffset = (collectRef = false) => {
    // Also handle collectRef for the init mount
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

    collectRef
      ? this.props.collectNodesOffset(
          this.props.x,
          this.props.y,
          data,
          this.nodesRef
        )
      : this.props.collectNodesOffset(this.props.x, this.props.y, data)
  }

  // * Section rendered block only

  // Edit section block name
  handleBlockNameChange = e => {
    this.props.thisNameRef.current.focus()
    if (checkSectionNameNotValid(e.target.innerText, this.props.data.name))
      this.props.thisNameRef.current.classList.add('invalid-block-name')
    else this.props.thisNameRef.current.classList.remove('invalid-block-name')
  }

  handleBlockNameBlur = e => {
    console.log('KKK', e)
    if (checkSectionNameNotValid(e.target.innerText, this.props.data.name))
      this.props.thisNameRef.current.innerText = this.props.data.name
  }

  render() {
    const {
      action,
      // input, output - undefined or object, inlineData - undefined or array
      data: { name, source, input, inlineData, output },
      inputBlocks,
      x,
      y,
      scale, // codeCanvas scale, mainly for SliderBlock
      collect,
      focused,
      selectedNodes,
      thisBlockRef,
      thisNameRef,
      isRenaming,
      draggable,
    } = this.props

    const {
      text,
      type,
      kind,
      inputNodes,
      outputNodes,
      description,
    } = _b5BlocksObject[source][name]
    let inputNodesCount = inputNodes === null ? 0 : inputNodes.length,
      outputNodesCount = outputNodes === null ? 0 : outputNodes.length

    let myBlock = null

    // Preview blocks can only be 'normal' kind
    switch (kind) {
      case 'input':
        myBlock = (
          <>
            {!action && (
              <div
                className={
                  'sudoBlock' +
                  (text === 'str' ? ' longInputWidth' : ' inputWidth')
                }
              ></div>
            )}
            <InputBlock
              action={action}
              className={'grab block ' + type + ' ' + kind}
              name={name}
              text={text}
              inlineData={inlineData}
              output={output}
              outputNodes={outputNodes}
              type={type}
              collect={collect}
              x={x}
              y={y}
              nodesRef={this.nodesRef}
              focused={focused}
              selectedNodes={selectedNodes}
              description={description}
            />
          </>
        )
        break
      case 'slider':
        myBlock = (
          <>
            {!action && <div className="sudoBlock sliderWidth"></div>}
            <SliderBlock
              action={action}
              className={'grab block ' + type + ' ' + kind}
              name={name}
              text={text}
              inlineData={inlineData}
              output={output}
              outputNodes={outputNodes}
              type={type}
              collect={collect}
              x={x}
              y={y}
              nodesRef={this.nodesRef}
              focused={focused}
              selectedNodes={selectedNodes}
              scale={scale}
              source={source}
              description={description}
            />
          </>
        )
        break
      case 'colorPicker':
        myBlock = (
          <>
            {!action && <div className="sudoBlock colorPickerWidth"></div>}
            <ColorPickerBlock
              action={action}
              className={'grab block ' + type + ' ' + kind}
              name={name}
              text={text}
              inlineData={inlineData}
              output={output}
              outputNodes={outputNodes}
              type={type}
              collect={collect}
              x={x}
              y={y}
              nodesRef={this.nodesRef}
              focused={focused}
              selectedNodes={selectedNodes}
              scale={scale}
              description={description}
            />
          </>
        )
        break
      case 'inline':
        // A InlineBlock has at most 2 inputs and 1 output
        const inlineCount = Math.max(inputNodesCount, outputNodesCount)
        myBlock = (
          <>
            {!action && (
              <div className={'sudoBlock inlineCount' + inlineCount}></div>
            )}
            <InlineBlock
              className={
                'grab block ' + type + ' ' + kind + ' inlineCount' + inlineCount
              }
              text={text}
              input={input}
              output={output}
              inputNodes={inputNodes}
              outputNodes={outputNodes}
              inputBlocks={inputBlocks}
              type={type}
              x={x}
              y={y}
              nodesRef={this.nodesRef}
              focused={focused}
              selectedNodes={selectedNodes}
              name={name}
              description={description}
            />
          </>
        )
        break
      case 'method':
        break
      case 'display':
        break
      case 'comment':
        // Very very special...
        myBlock = (
          <>
            {!action && <div className="sudoBlock commentWidth"></div>}
            <CommentBlock
              action={action}
              className="grab block comment"
              name={name}
              text={text}
              inlineData={inlineData}
              collect={collect}
              x={x}
              y={y}
              nodesRef={this.nodesRef}
              focused={focused}
              selectedNodes={selectedNodes}
            />
          </>
        )
        break
      default:
        /* kind === 'normal' */
        let blockInputNodes = [],
          blockOutputNodes = [],
          inputNodesText = [],
          outputNodesText = []

        if (inputNodes !== null) {
          for (let i in inputNodes) {
            blockInputNodes.push(
              <Node
                key={x + y + ' inputNode' + i}
                nodeClass="input"
                count={inputNodesCount}
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
                ref={this.nodesRef.input[i]}
                focused={focused}
                selected={selectedNodes.input.includes(i)}
                hintName={inputNodes[i].name}
                hintDescription={inputNodes[i].description}
                hintType={inputNodes[i].type[0]}
              />
            )
            inputNodesText.push(
              <p
                key={x + y + ' inputText' + i}
                className={'nodeText inputText count' + inputNodesCount}
              >
                {inputNodes[i].text}
              </p>
            )
          }
        }

        if (outputNodes !== null) {
          for (let i in outputNodes) {
            blockOutputNodes.push(
              <Node
                key={x + y + 'outputNode ' + i}
                nodeClass="output"
                count={outputNodesCount}
                type={type}
                connectType={
                  output[i].length !== 0 ? outputNodes[i].type[0] : null
                } // output can only be [] (when not connected) instead of null
                ref={this.nodesRef.output[i]}
                focused={focused}
                selected={selectedNodes.output.includes(i)}
                hintName={outputNodes[i].name}
                hintDescription={outputNodes[i].description}
                hintType={outputNodes[i].type[0]}
                hintSide={'down'}
              />
            )
            outputNodesText.push(
              <p
                key={x + y + 'outputText ' + i}
                className={'nodeText outputText count' + outputNodesCount}
              >
                {outputNodes[i].text}
              </p>
            )
          }
        }

        let maxCount = Math.max(inputNodesCount, outputNodesCount)

        myBlock = (
          <>
            {!action && (
              <div className={'sudoBlock nodesCount' + maxCount}></div>
            )}
            <div
              className={
                type +
                ' grab block ' +
                kind +
                ' nodesCount' +
                maxCount +
                (draggable ? ' draggable' : '')
              }
              data-name={name}
              data-hint={true}
              data-hint-name={name}
              data-hint-description={description}
              data-hint-type={type}
              data-hint-category={'block'}
            >
              {inputNodes !== null ? (
                <>
                  <div className={'nodes inputNodes blockCount' + maxCount}>
                    {blockInputNodes}
                  </div>
                  <div
                    className={'nodesText inputNodesText blockCount' + maxCount}
                  >
                    {inputNodesText}
                  </div>
                </>
              ) : null}

              {/* No need to split... while looks better */}
              {thisNameRef && (
                <div
                  className={'blockName' + (isRenaming ? ' textEditing' : '')}
                  ref={thisNameRef}
                  // contentEditable={isRenaming ? true : false}
                  contentEditable
                  suppressContentEditableWarning="true"
                  onInput={this.handleBlockNameChange}
                  onBlur={this.handleBlockNameBlur}
                >
                  {text}
                </div>
              )}
              {!thisNameRef && <div className="blockName">{text}</div>}

              {outputNodes !== null ? (
                <>
                  <div
                    className={
                      'nodesText outputNodesText blockCount' + maxCount
                    }
                  >
                    {outputNodesText}
                  </div>
                  <div className={'nodes outputNodes blockCount' + maxCount}>
                    {blockOutputNodes}
                  </div>
                </>
              ) : null}
            </div>
          </>
        )
        break
    }

    return (
      <div
        className={
          'blockFill' +
          (focused ? ' focused' : '') +
          (action ? ' action' : ' preview')
        }
        style={{
          top: this.y * lineHeight + 'px',
          left: this.x * roomWidth + 'px',
        }}
        ref={thisBlockRef}
        data-name={name}
      >
        {myBlock}
      </div>
    )
  }
}

export default BlockRenderer
