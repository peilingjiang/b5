import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import { IconList } from '../headers'

import * as method from './editorMethod'
import Playground from '../playground/playground'
import Factory from '../factory/factory'
import '../../postcss/components/editor/editor.css'

import b5 from '../../b5.js/src/app'

import {
  defaultEditor,
  defaultEditorCanvasStyle,
  nativeSectionDataToAdd,
  nativeSectionStyleToAdd,
} from './defaultValue'
import Logo from '../../img/logo/logo-original.svg'

export default class Editor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editor: JSON.parse(JSON.stringify(defaultEditor)),
      editorCanvasStyle: JSON.parse(JSON.stringify(defaultEditorCanvasStyle)),
    }

    /*

    > editor
    {
      playground: {
        // name: 'playground',
        // removable: false,
        type: 'playground',
        lineStyle: {},
        blocks: {},
      },
      factory: {
        variable: [],
        function: [],
        object: [],
      },
    }

    */

    this.b = new b5()
    // Make sure all the previous (or default) section blocks are registered
    this.b.update(this.state.editor)

    this.leftElement = createRef()
    this.rightElement = createRef()
    this.separator = createRef()
  }

  componentDidMount() {
    // Add drag listener
    this.props.bridge(this.b)
    this.separator.current.addEventListener('mousedown', this.handleDrag)
  }

  componentDidUpdate() {
    // Directly send b5 object to viewer to render
    this.props.bridge(this.b)
  }

  componentWillUnmount() {
    if (this.separator.current)
      this.separator.current.removeEventListener('mousedown', this.handleDrag)
  }

  shouldComponentUpdate(nextProps, nextState) {
    // EDITOR
    if (!equal(nextState.editor, this.state.editor))
      // Update this.b b5 object every time editor updates
      // BEFORE any rendering
      this.b.update(nextState.editor)

    // EDITOR CANVAS STYLE
    if (!equal(nextState.editorCanvasStyle, this.state.editorCanvasStyle)) {
    }

    return !equal(nextState, this.state)
  }

  collectEditorData = (data, task, source, index = 0) => {
    // Combine data from all sources: playground, variable, function, object
    this.setState(
      prevState => {
        let newState = JSON.parse(JSON.stringify(prevState))
        const newEditor = newState.editor
        let thisBlocks
        if (source === 'playground') thisBlocks = newEditor.playground.blocks
        else thisBlocks = newEditor.factory[source][index].blocks

        switch (task) {
          case 'addConnection':
            // [outputBlockInd, outputNodeInd, inputBlockInd, inputNodeInd]
            method.addConnection(data, thisBlocks)
            break
          case 'removeConnection':
            // [inputBlockIndY, inputBlockIndX, inputNodeInd]
            method.removeConnection(data, thisBlocks)
            break
          case 'relocateBlock':
            // [x1, y1, x2, y2]
            method.relocateBlock(data, thisBlocks)
            break
          case 'deleteBlock':
            method.deleteBlock(data, thisBlocks)
            break
          case 'inlineDataChange':
            method.inlineDataChange(data, thisBlocks)
            break

          default:
            break
        }

        return newState
      },
      function () {
        // if (source !== 'playground')
        //   console.log(this.state.editor.factory[source][index])
      }
    )
  }

  collectEditorCanvasStyle = (data, source, index = 0) => {
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))
      const newEditorStyle = newState.editorCanvasStyle
      if (source === 'playground') newEditorStyle[source] = data
      else newEditorStyle.factory[source][index] = data

      return newState
    })
  }

  addSection = type => {
    const toAdd = JSON.parse(nativeSectionDataToAdd), // Data
      toAddStyle = JSON.parse(nativeSectionStyleToAdd) // Style

    toAdd.name = `new${
      type.slice(0, 3) + this.state.editor.factory[type].length
    }`
    toAdd.type = type

    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) // Deep copy
      newState.editor.factory[type].push(toAdd)
      newState.editorCanvasStyle.factory[type].push(toAddStyle)
      return newState
    })
  }

  handleDrag = e => {
    let mouseDown = {
      e,
      leftWidth: this.leftElement.current.offsetWidth,
      rightWidth: this.rightElement.current.offsetWidth,
    }
    const handleMoveSeparator = this.moveSeparator.bind(this, mouseDown)
    document.addEventListener('mousemove', handleMoveSeparator)
    document.addEventListener('mouseup', function _listener() {
      document.removeEventListener('mousemove', handleMoveSeparator)
      document.removeEventListener('mouseup', _listener)
    })
  }

  moveSeparator = (mouseDown, e) => {
    let deltaX = Math.min(
      Math.max(e.clientX - mouseDown.e.clientX, -mouseDown.leftWidth),
      mouseDown.rightWidth
    )
    const leftPercent = (mouseDown.leftWidth + deltaX) / window.innerWidth
    this.leftElement.current.style.width = leftPercent * 100 + '%'
    this.rightElement.current.style.width = (1 - leftPercent) * 100 + '%'
  }

  render() {
    const { editor, editorCanvasStyle } = this.state

    return (
      <div id="editor" className="editor">
        <div className="header">
          <IconList
            iconsName={['Settings', 'File', 'Share']}
            onClickFunc={[null, null, null]}
          />
          <a
            href="https://github.com/peilingjiang/b5"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img id="logo" src={Logo} alt="b5" />
          </a>
        </div>

        <div className="split">
          <div ref={this.leftElement} id="editor-left">
            <div id="factory">
              {/* Variables Functions Objects */}
              <Factory
                data={editor.factory}
                canvasStyle={editorCanvasStyle.factory}
                addSection={this.addSection}
                collect={this.collectEditorData}
                collectStyle={this.collectEditorCanvasStyle}
                separatorRef={this.separator}
              />
              {/* <div className="shadow"></div> */}
            </div>
          </div>

          <div ref={this.rightElement} id="editor-right">
            <Playground
              data={editor.playground}
              canvasStyle={editorCanvasStyle.playground}
              collect={this.collectEditorData}
              collectStyle={this.collectEditorCanvasStyle}
            />
          </div>
        </div>
      </div>
    )
  }
}
