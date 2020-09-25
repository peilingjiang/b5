import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import { IconList } from '../headers/headers'

import * as method from './editorMethod'
import * as secMethod from './sectionMethod'

import Playground from '../playground/playground'
import Factory from '../factory/factory'
import BlockSearch from '../blockSearch/blockSearch'
import '../../postcss/components/editor/editor.css'

import b5 from '../../b5.js/src/app'

import { defaultEditor, defaultEditorCanvasStyle } from './defaultValue'
import Logo from '../../img/logo/logo.svg'

export const _b = new b5() // b5 Object for the whole page to use

export class Editor extends Component {
  constructor(props) {
    super()

    this.state = {
      editor: JSON.parse(JSON.stringify(defaultEditor)),
      editorCanvasStyle: JSON.parse(JSON.stringify(defaultEditorCanvasStyle)),
      searching: false,
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

    // Make sure all the previous (or default) section blocks are registered
    _b.update(this.state.editor)

    this.leftElement = createRef()
    this.rightElement = createRef()
    this.separator = createRef()

    // Create ref for each codeCanvas
    this.codeCanvasRef = {
      playground: createRef(),
      factory: {
        variable: [],
        function: [],
        object: [],
      },
    }
    for (let cat in this.state.editor.factory)
      this.codeCanvasRef.factory[cat] = this.state.editor.factory[cat].map(() =>
        createRef()
      )

    // Search data
    this.search = {
      source: null,
      index: null, // Index of the codeCanvas
      y: null, // Y of the blockRoom
      x: null, // X of the blockRoom
    }
  }

  componentDidMount() {
    // Add drag listener
    this.props.bridge(this.state.editor)
    this.separator.current.addEventListener('mousedown', this.handleDrag)
  }

  componentDidUpdate() {
    // Directly send b5 object to viewer to render
    this.props.bridge(this.state.editor)
  }

  componentWillUnmount() {
    if (this.separator.current)
      this.separator.current.removeEventListener('mousedown', this.handleDrag)
  }

  shouldComponentUpdate(nextProps, nextState) {
    // EDITOR
    if (!equal(nextState.editor, this.state.editor))
      // Update b b5 object every time editor updates
      // BEFORE any rendering
      _b.update(nextState.editor)

    // EDITOR CANVAS STYLE
    if (!equal(nextState.editorCanvasStyle, this.state.editorCanvasStyle)) {
    }

    return !equal(nextState, this.state)
  }

  breakSearch = () => {
    this.setState({ searching: false })
  }

  collectEditorData = (data, task, source, index = 0) => {
    // Combine data from all sources: playground, variable, function, object

    // pre-setState tasks
    if (task.includes('pre')) {
      switch (task) {
        case 'preSearchBlock':
          method.searchBlock(this, data, source, index)
          break

        default:
          break
      }
      return
    }

    // setState tasks
    this.setState(
      prevState => {
        let newState = JSON.parse(JSON.stringify(prevState))
        const newEditor = newState.editor
        let thisBlocks
        if (source === 'playground') thisBlocks = newEditor.playground.blocks
        else thisBlocks = newEditor.factory[source][index].blocks

        switch (task) {
          case 'addBlock':
            // [name, y, x]
            method.addBlock(data, thisBlocks)
            break
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
        // * After update the editorData...
        // * if changes made to factory, bump updates in playground blocks
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

  // ! Section methods
  section = (task, type, data = null) => {
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) // Deep copy
      const f = newState.editor.factory
      const fStyle = newState.editorCanvasStyle.factory

      switch (task) {
        case 'add':
          // No data
          this.codeCanvasRef.factory[type].push(createRef()) // Create new canvas ref
          secMethod.addSection(type, f, fStyle)
          break
        case 'delete':
          // [index]
          secMethod.deleteSection(
            type,
            data[0],
            this.codeCanvasRef.factory,
            f,
            fStyle
          )
          break

        default:
          break
      }

      return newState
    })
  }

  // ! Split methods
  handleDrag = e => {
    e.preventDefault()
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
    const { editor, editorCanvasStyle, searching } = this.state
    const {
      search: { source, index, x, y },
    } = this

    return (
      <div id="editor" className="editor">
        <div className="header">
          <IconList
            iconsName={['Settings', 'File', 'Share']}
            iconsOnClickFunc={[null, null, null]}
            iconsDisabled={[false, false, false]}
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
                section={this.section}
                collect={this.collectEditorData}
                collectStyle={this.collectEditorCanvasStyle}
                separatorRef={this.separator}
                factoryCodeCanvasRef={this.codeCanvasRef.factory}
              />
              {/* <div className="shadow"></div> */}
            </div>
          </div>

          <div ref={this.rightElement} id="editor-right">
            <Playground
              data={editor.playground}
              canvasStyle={editorCanvasStyle.playground}
              handleBlockSearch={this.handleBlockSearch}
              collect={this.collectEditorData}
              collectStyle={this.collectEditorCanvasStyle}
              playgroundCodeCanvasRef={this.codeCanvasRef.playground}
            />
          </div>
        </div>

        {searching && (
          <BlockSearch
            breakSearch={this.breakSearch}
            collect={this.collectEditorData}
            factoryData={editor.factory}
            codeCanvasSource={source}
            codeCanvasIndex={index}
            roomY={y}
            roomX={x}
          />
        )}
      </div>
    )
  }
}
