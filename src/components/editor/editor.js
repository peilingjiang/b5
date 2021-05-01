import { Component, createRef } from 'react'
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
import { makeBlock } from '../../b5.js/src/core/make'

import { lineNumberWidth, blockAlphabetHeight, gap } from '../constants'
import {
  defaultEditor,
  // defaultEditorCanvasStyle,
  introEditor,
  introEditorCanvasStyle,
  nativeSectionStyleToAdd,
} from './defaultValue'
import Logo from '../../img/logo/logo.svg'
import { isMacOs, isWindows } from 'react-device-detect'
import Hint from '../hint/hint'

// For loading the version number
import packageJSON from '../../../package.json'

/* -------------------------------- Examples -------------------------------- */

const exampleCount = 4

/* -------------------------------------------------------------------------- */

export default class Editor extends Component {
  constructor(props) {
    super(props)

    let hasEditorInSession = false
    let sessionEditor
    if (sessionStorage.getItem('editor') !== null) {
      hasEditorInSession = true
      sessionEditor = JSON.parse(sessionStorage.getItem('editor'))
    }

    this.state = {
      editor: hasEditorInSession
        ? sessionEditor
        : JSON.parse(JSON.stringify(introEditor)),
      editorCanvasStyle: hasEditorInSession
        ? this._resolveLoadB5FileStyle(sessionEditor)
        : JSON.parse(JSON.stringify(introEditorCanvasStyle)),
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

    this.currentEntities = createRef() // For section method
    this.currentEntities.current = []

    this.randomExampleCounter = createRef()
    this.randomExampleCounter.current = 1
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

    // Update b b5 object every time editor updates
    // BEFORE any rendering
    // if (!equal(nextState.editor, this.state.editor))
    //   _b.update(nextState.editor)

    // EDITOR CANVAS STYLE
    // if (!equal(nextState.editorCanvasStyle, this.state.editorCanvasStyle)) {}

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

        let thisBlocks, sectionName
        if (source === 'playground') {
          thisBlocks = newEditor.playground.blocks
          sectionName = 'playground'
        } else {
          thisBlocks = newEditor.factory[source][index].blocks
          sectionName = newEditor.factory[source][index].name
        }

        switch (task) {
          case 'addBlock':
            // [name, y, x]
            const [name, y, x] = data
            const newBlock = makeBlock(name)

            if (!thisBlocks[y] || !thisBlocks[y][x]) {
              method.addBlock(data, newBlock, thisBlocks)
              _b.handleBlock(
                [newBlock, y, x],
                thisBlocks,
                task,
                source,
                sectionName
              )
            }
            break

          case 'addConnection':
            // [outputBlockInd, outputNodeInd, inputBlockInd, inputNodeInd]
            let result = method.addConnection(data, thisBlocks)
            /**
             * result: outputNodeOutputs, inputNodeInput
             */
            const [, , inputBlockInd, inputNodeInd] = data
            _b.handleBlock(
              [inputBlockInd, inputNodeInd, result],
              thisBlocks,
              task,
              source,
              sectionName
            )
            break

          case 'removeConnection':
            // [inputBlockIndY, inputBlockIndX, inputNodeInd]
            method.removeConnection(data, thisBlocks)
            _b.handleBlock(data, thisBlocks, task, source, sectionName)
            break

          case 'relocateBlock':
            // [x1, y1, x2, y2]
            const [, , x2, y2] = data

            if (!thisBlocks[y2] || !thisBlocks[y2][x2]) {
              // Only when the target location is empty
              // - Modify data first
              method.relocateBlock(data, thisBlocks)
              // - Then modify b5
              if (!_b.ignores(thisBlocks[y2][x2].name))
                _b.handleBlock(
                  [...data, thisBlocks[y2][x2]],
                  thisBlocks,
                  task,
                  source,
                  sectionName
                )
            }
            break

          case 'deleteBlock':
            // [y, x]
            if (thisBlocks[data[0]] && thisBlocks[data[0]][data[1]]) {
              const deleteBlockData = Object.assign(
                {},
                thisBlocks[data[0]][data[1]]
              )
              let outputsToDelete = method.deleteBlock(data, thisBlocks)
              _b.handleBlock(
                [...data, outputsToDelete, deleteBlockData],
                thisBlocks,
                task,
                source,
                sectionName
              )
            }
            break

          case 'inlineDataChange':
            // [x, y, dataIndex, thisInlineData]
            method.inlineDataChange(data, thisBlocks)
            if (!_b.ignores(thisBlocks[data[1]][data[0]].name))
              _b.handleBlock(data, thisBlocks, task, source, sectionName)
            break

          default:
            break
        }

        newState.hardRefresh = false

        // * Promote to playground for changes in sections
        if (source !== 'playground')
          _b.handleBumpSectionUpdate(
            source,
            sectionName,
            newEditor.playground.blocks,
            task
          )

        return newState
      },
      function () {
        // * After update the editorData...
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

        const playground = newState.editor.playground.blocks

        switch (task) {
          case 'add':
            // No data
            this.codeCanvasRef.factory[type].push(createRef()) // Create new canvas ref
            let nameAdd = secMethod.addSection(type, f, fStyle)

            // No need to bump update for add tasks
            _b.handleSection(
              task,
              type,
              [nameAdd, method.getSectionNames(f[type])],
              playground
            )
            break

          case 'delete':
            // [index]
            let nameDelete = secMethod.deleteSection(
              type,
              data[0],
              this.codeCanvasRef.factory,
              f,
              fStyle
            )

            if (_b.factory[type][nameDelete])
              this.currentEntities.current = _b.factory[type][
                nameDelete
              ].entities.getEntities()
            _b.handleSection(
              task,
              type,
              [nameDelete, this.currentEntities.current],
              playground
            )
            break

          case 'rename':
            const oldBlock = f[type][data[0]],
              newName = data[1]

            if (_b.factory[type][oldBlock.name])
              this.currentEntities.current = _b.factory[type][
                oldBlock.name
              ].entities.getEntities()
            _b.handleSection(
              task,
              type,
              [
                oldBlock.name,
                newName,
                oldBlock.lineStyles,
                oldBlock.blocks,
                this.currentEntities.current,
              ],
              playground
            )
            secMethod.renameSection(type, data[0], newName, f)
            break

          default:
            break
        }

        newState.hardRefresh = false

        return newState
      },
      function () {
        // Clean for Strict Mode
        if (task === 'add')
          _b.clearCategories(
            type,
            method.getSectionNames(this.state.editor.factory[type])
          )

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
      // TODO: Add warning!
      this.loadNewEditor(defaultEditor)
      return
    }
  }

  save = () => {
    method._saveEditor(this.state.editor, packageJSON.version)
  }

  // ! Drag and Drop
  handleDragenter = e => {
    if (e.dataTransfer.types.length) {
      e.preventDefault()
      e.stopPropagation()
      // this.headerRef.current.classList.add('no-events')
      // this.splitRef.current.classList.add('no-events')
      this.setState({ dragging: true })
    }
  }

  handleDragleave = e => {
    if (e.dataTransfer.types.length) {
      e.preventDefault()
      e.stopPropagation()

      if (e.target.className.includes('fileUpload'))
        this.setState({ dragging: false })
    }
  }

  handleDragover = e => {
    e.preventDefault()
  }

  handleDrop = e => {
    if (e.dataTransfer.types.length) {
      e.preventDefault()
      e.stopPropagation()
      this.readFile(e.dataTransfer.files[0])

      if (e.target.className.includes('fileUpload'))
        this.setState({ dragging: false })
    }
  }

  readFile = file => {
    if (
      file &&
      file.type.match('application/json') &&
      file.name.includes('.b5')
    ) {
      let reader = new FileReader()
      let that = this

      reader.onload = e => {
        that.loadNewEditor(JSON.parse(e.target.result))
      }

      reader.readAsText(file)
    }

    return false
  }

  /* ----------------------------- Load New Editor ---------------------------- */

  loadNewEditor = newEditor => {
    this.setState(
      prevState => {
        const newState = JSON.parse(JSON.stringify(prevState))

        newState.hardRefresh = true

        newState.editor = newEditor
        newState.editorCanvasStyle = this._resolveLoadB5FileStyle(newEditor)
        this._createCodeCanvasRef(newEditor)
        this._resolveLoadB5File(newEditor)

        return newState
      },
      function () {
        this._storeEditor()
      }
    )
  }

  /* -------------------------------------------------------------------------- */

  _resolveLoadB5File = (e = this.state.editor) => {
    _b.update(e)
    this.props.bridge(e)
  }

  _resolveLoadB5FileStyle = r => {
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
    // TODO: Remove this function
    this.loadNewEditor(defaultEditor)
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

  /* ----------------------------- Random Example ----------------------------- */

  randomExample = () => {
    const fileEditor = require(`../../examples/example${this.randomExampleCounter.current}.b5.json`)
    this.loadNewEditor(fileEditor)

    this.randomExampleCounter.current++
    if (this.randomExampleCounter.current > exampleCount)
      this.randomExampleCounter.current = 1
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

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

    const functions = {
      save: this.save,
      new: this.initEditor,
      random: this.randomExample,
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
            v{method.parseVersion(packageJSON.version, true)}
            <span id="text-options">
              <a
                href="https://github.com/peilingjiang/b5/issues/new"
                rel="noopener noreferrer"
                target="_blank"
              >
                report issue
              </a>
            </span>
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

        <Hint />
        <FileUpload display={dragging} ref={this.fileUploadRef} />
      </div>
    )
  }
}

/* -------------------------------------------------------------------------- */

// Header icon setup

// const iconNames = ['Settings', 'File', 'Share', 'add']
const iconNames = ['Settings', 'File', 'Share']
// const iconFunctions = [null, null, null, this.addBlock]
const iconFunctions = [null, null, null]
const allFalse = [false, false, false]
