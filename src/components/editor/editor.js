import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import { IconList } from '../headers/headers'
import FoldIcon from '../playground/foldIcon'

import * as method from './editorMethod'
import * as secMethod from './sectionMethod'

import Playground from '../playground/playground'
import Factory from '../factory/factory'
import BlockSearch from '../blockSearch/blockSearch'
import FileUpload from './fileUpload'
import '../../postcss/components/editor/editor.css'

import _b from './b5ObjectWrapper'

import { lineNumberWidth, blockAlphabetHeight, gap } from '../constants'
import {
  defaultEditor,
  defaultEditorCanvasStyle,
  nativeSectionStyleToAdd,
} from './defaultValue'
import Logo from '../../img/logo/logo.svg'
import { isMacOs, isWindows } from 'react-device-detect'

export default class Editor extends Component {
  constructor(props) {
    super()

    let hasEditorInSession = false
    let sessionEditor
    if (sessionStorage.getItem('editor') !== null) {
      hasEditorInSession = true
      sessionEditor = JSON.parse(sessionStorage.getItem('editor'))
    }

    this.state = {
      editor: hasEditorInSession
        ? sessionEditor
        : JSON.parse(JSON.stringify(defaultEditor)),
      editorCanvasStyle: hasEditorInSession
        ? this._resolveLoadBr5FileStyle(sessionEditor)
        : JSON.parse(JSON.stringify(defaultEditorCanvasStyle)),
      searching: false,
      dragging: false,
      hardRefresh: false,
      folded: false, // Fold Factory or not
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

    this.editorRef = createRef()
    this.headerRef = createRef()
    this.splitRef = createRef()
    this.fileUploadRef = createRef()

    this.leftElement = createRef()
    this.rightElement = createRef()
    this.separator = createRef()

    // Create ref for each codeCanvas
    this._createCodeCanvasRef(this.state.editor)

    // Search data
    this.search = {
      source: null,
      index: null, // Index of the codeCanvas
      y: null, // Y of the blockRoom
      x: null, // X of the blockRoom
    }
  }

  _createCodeCanvasRef = data => {
    delete this.codeCanvasRef
    this.codeCanvasRef = {
      playground: createRef(),
      factory: {
        variable: [],
        function: [],
        object: [],
      },
    }
    for (let cat in data.factory)
      this.codeCanvasRef.factory[cat] = data.factory[cat].map(() => createRef())
  }

  componentDidMount() {
    // Add drag listener
    this.props.bridge(this.state.editor)
    this.separator.current.addEventListener('mousedown', this.handleDrag)

    document.addEventListener('keydown', this.handleKeydown)

    this.editorRef.current.addEventListener('dragenter', this.handleDragenter)
    this.editorRef.current.addEventListener('dragleave', this.handleDragleave)
    this.editorRef.current.addEventListener(
      'dragover',
      this.handleDragover,
      false
    )
    this.editorRef.current.addEventListener('drop', this.handleDrop, false)
  }

  componentDidUpdate() {
    // Directly send b5 object to viewer to render
    this.props.bridge(this.state.editor)
  }

  componentWillUnmount() {
    if (this.separator.current)
      this.separator.current.removeEventListener('mousedown', this.handleDrag)

    document.removeEventListener('keydown', this.handleKeydown)
    this.editorRef.current.removeEventListener(
      'dragenter',
      this.handleDragenter
    )
    this.editorRef.current.removeEventListener(
      'dragleave',
      this.handleDragleave
    )
    this.editorRef.current.removeEventListener(
      'dragover',
      this.handleDragover,
      false
    )
    this.editorRef.current.removeEventListener('drop', this.handleDrop, false)

    window.sessionStorage.removeItem('color')
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

        newState.hardRefresh = false

        return newState
      },
      function () {
        // * After update the editorData...
        // * if changes made to factory, bump updates in playground blocks
        // if (source !== 'playground')
        //   console.log(this.state.editor.factory[source][index])

        this._storeEditor()
      }
    )
  }

  _storeEditor = () => {
    // Store to sessionStorage
    sessionStorage.setItem('editor', JSON.stringify(this.state.editor))
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
    this.setState(
      prevState => {
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

          case 'rename':
            secMethod.renameSection(type, data[0], data[1], f)
            break

          default:
            break
        }

        newState.hardRefresh = false

        return newState
      },
      function () {
        this._storeEditor()
      }
    )
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
    e.preventDefault()
    let deltaX = Math.min(
      Math.max(e.clientX - mouseDown.e.clientX, -mouseDown.leftWidth),
      mouseDown.rightWidth
    )
    const leftPercent = (mouseDown.leftWidth + deltaX) / window.innerWidth
    this.leftElement.current.style.width = leftPercent * 100 + '%'
    this.rightElement.current.style.width = (1 - leftPercent) * 100 + '%'
  }

  // ! KEYS
  handleKeydown = e => {
    if (e.key === 's' && e.metaKey) {
      // ! SAVE
      e.preventDefault()
      this.save()
      return
    }

    if (
      e.keyCode === 192 &&
      ((e.metaKey && isMacOs) || (e.ctrlKey && isWindows)) &&
      e.altKey
    ) {
      e.preventDefault()
      this.initEditor()
      return
    }
  }

  save = () => {
    method._saveEditor(this.state.editor)
  }

  // ! Drag and Drop
  handleDragenter = e => {
    e.preventDefault()
    e.stopPropagation()
    // this.headerRef.current.classList.add('no-events')
    // this.splitRef.current.classList.add('no-events')
    this.setState({ dragging: true })
  }

  handleDragleave = e => {
    e.preventDefault()
    e.stopPropagation()

    if (e.target.className.includes('fileUpload'))
      this.setState({ dragging: false })
  }

  handleDragover = e => {
    e.preventDefault()
  }

  handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    let file = e.dataTransfer.files[0]
    this.readFile(file)

    if (e.target.className.includes('fileUpload'))
      this.setState({ dragging: false })
  }

  readFile = file => {
    if (file.type.match('application/json') && file.name.includes('.b5')) {
      let reader = new FileReader()
      let that = this

      reader.onload = e => {
        let result = JSON.parse(e.target.result)
        let s = this._resolveLoadBr5FileStyle(result)
        that.setState(
          prevState => {
            const newState = JSON.parse(JSON.stringify(prevState))
            newState.editorCanvasStyle = s

            newState.hardRefresh = true
            newState.editor = result
            this._createCodeCanvasRef(result)

            return newState
          },
          function () {
            that._resolveLoadB5File()
            that._storeEditor()
          }
        )
      }

      reader.readAsText(file)
    }

    return false
  }

  _resolveLoadB5File = () => {
    _b.update(this.state.editor)
    this.props.bridge(this.state.editor)
  }

  _resolveLoadBr5FileStyle = r => {
    // r - result / editor data
    const style = {
      playground: {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: 1,
      },
      factory: {
        variable: [],
        function: [],
        object: [],
      },
    }

    r.factory.variable.forEach(i => {
      style.factory.variable.push(JSON.parse(nativeSectionStyleToAdd))
    })

    r.factory.function.forEach(i => {
      style.factory.function.push(JSON.parse(nativeSectionStyleToAdd))
    })

    // object...

    return style
  }

  initEditor = () => {
    this.setState(
      prevState => {
        const newState = JSON.parse(JSON.stringify(prevState))
        newState.hardRefresh = true
        newState.editor = JSON.parse(JSON.stringify(defaultEditor))
        newState.editorCanvasStyle = this._resolveLoadBr5FileStyle(
          newState.editor
        )
        this._createCodeCanvasRef(newState.editor)

        return newState
      },
      function () {
        this._resolveLoadB5File()
        this._storeEditor()
      }
    )
  }

  foldFactory = () => {
    if (!this.state.folded) {
      sessionStorage.setItem(
        'separatorPosition',
        JSON.stringify({
          left: this.leftElement.current.offsetWidth / window.innerWidth,
          right: this.rightElement.current.offsetWidth / window.innerWidth,
        })
      )
      this.leftElement.current.classList.remove('editor-left-min-width')
      this.leftElement.current.style.width = gap + 'px'
      this.rightElement.current.style.width = 100 + '%'
    } else {
      this.leftElement.current.classList.add('editor-left-min-width')
      const separatorPosition = JSON.parse(
        sessionStorage.getItem('separatorPosition')
      )
      this.leftElement.current.style.width = separatorPosition.left * 100 + '%'
      this.rightElement.current.style.width =
        separatorPosition.right * 100 + '%'
    }
    this.setState({ folded: !this.state.folded })
  }

  addBlock = () => {}

  render() {
    const {
      editor,
      editorCanvasStyle,
      searching,
      dragging,
      hardRefresh,
      folded,
    } = this.state
    const {
      search: { source, index, x, y },
    } = this

    // const iconNames = ['Settings', 'File', 'Share', 'add']
    const iconNames = ['Settings', 'File', 'Share']
    // const iconFunctions = [null, null, null, this.addBlock]
    const iconFunctions = [null, null, null]
    const allFalse = [false, false, false]
    const functions = {
      save: this.save,
      new: this.initEditor,
    }

    return (
      <div id="editor" className="editor" ref={this.editorRef}>
        <div className="header" ref={this.headerRef}>
          <IconList
            iconsName={iconNames}
            iconsOnClickFunc={iconFunctions}
            iconsDisabled={allFalse}
            // Functions
            functions={functions}
          />

          <p className="dev issueTag">
            {/* Take env! */}v{process.env.REACT_APP_VERSION} alpha -{' '}
            <a
              href="https://github.com/peilingjiang/b5/issues/new"
              rel="noopener noreferrer"
              target="_blank"
            >
              report issue
            </a>
          </p>

          <a
            href="https://github.com/peilingjiang/b5"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img id="logo" src={Logo} alt="b5" />
          </a>
        </div>

        <div className="split" ref={this.splitRef}>
          <div
            ref={this.leftElement}
            id="editor-left"
            className="editor-left-min-width"
          >
            <div id="factory">
              {/* Variables Functions Objects */}
              {!folded && (
                <Factory
                  data={editor.factory}
                  canvasStyle={editorCanvasStyle.factory}
                  section={this.section}
                  collect={this.collectEditorData}
                  collectStyle={this.collectEditorCanvasStyle}
                  factoryCodeCanvasRef={this.codeCanvasRef.factory}
                  hardRefresh={hardRefresh}
                />
              )}
              {/* <div className="shadow"></div> */}

              <div
                ref={this.separator}
                className={'separator' + (folded ? ' no-events' : '')}
              ></div>

              <FoldIcon folded={folded} foldFunction={this.foldFactory} />
            </div>
          </div>

          <div ref={this.rightElement} id="editor-right">
            <Playground
              data={editor.playground}
              canvasStyle={editorCanvasStyle.playground}
              collect={this.collectEditorData}
              collectStyle={this.collectEditorCanvasStyle}
              playgroundCodeCanvasRef={this.codeCanvasRef.playground}
              hardRefresh={hardRefresh}
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

        <FileUpload display={dragging} ref={this.fileUploadRef} />
      </div>
    )
  }
}
