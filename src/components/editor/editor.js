import React, { useRef, useEffect, useState } from 'react'

import { drag, usePrevious } from '../main'
import {
  lineNumberWidth,
  blockAlphabetHeight,
  factoryCanvasDefaultScale,
  sectionHeightDefault,
} from '../constants'
import Playground from '../playground/playground'
import Factory from '../factory/factory'
import '../../postcss/components/editor/editor.css'

import Logo from '../../img/logo/logo-original.svg'
import Settings from '../../img/toolbar-icon/settings.svg'
import File from '../../img/toolbar-icon/file.svg'
import Share from '../../img/toolbar-icon/share.svg'

const Editor = ({ bridge }) => {
  /* Editor data */
  const [editor, setEditor] = useState({
    playground: {
      type: 'playground',
      lineStyles: {},
      blocks: {},
    },
    factory: {
      variable: [
        // 0 (The whole section canvas)
        {
          /* --- data --- */
          name: 'cnv' /* For the section/constructed block */,
          removable: false /* Can we delete the section? */,
          type: 'variable' /* What is the type of the customized block? */,
          lineStyles: {} /* lineStyles */,
          blocks: {
            /* blocks */
            '0': {
              /* Line number - start from 0 */
              '0': {
                /* Column number - start from 0 */
                name: 'number',
                inlineData: [500],
                output: { '0': [1, 0, 0] }, // For block rendering
              },
              '1': {
                name: 'numberSlider',
                inlineData: [300, 0, 1000, 100],
                output: { '0': [1, 0, 1] },
              },
            },
            '1': {
              '0': {
                name: 'createCanvas',
                input: {
                  '0': [0, 0, 0], // Line number, column number, index of the node
                  '1': [0, 1, 0],
                },
                output: {
                  '0': null,
                },
              },
              '1': {
                name: 'background',
                input: {
                  '0': null,
                  '1': null,
                  '2': null,
                  '3': null,
                },
              },
            },
          },
        },
        // 1...
      ],
      function: [],
      object: [],
    },
  })

  /* canvasStyle is stored separately in Editor (for update efficiency) */
  const [editorCanvasStyle, setEditorCanvasStyle] = useState({
    playground: {
      left: lineNumberWidth,
      top: blockAlphabetHeight,
      scale: 1,
    },
    factory: {
      variable: [
        /* --- canvasStyle --- */
        {
          left: lineNumberWidth,
          top: blockAlphabetHeight,
          scale: factoryCanvasDefaultScale,
          sectionHeight: sectionHeightDefault,
        },
      ],
      function: [],
      object: [],
    },
  })

  const leftElement = useRef(),
    rightElement = useRef(),
    separator = useRef()

  // Editor updated
  const [sentEditor, setSentEditor] = useState(false) // Ever sent to Viewer?
  const prevEditor = usePrevious(editor) // Previous editor state
  useEffect(() => {
    if (editor !== prevEditor || !sentEditor) {
      setSentEditor(true)
      bridge(editor)
    }
  }, [editor, prevEditor, sentEditor, bridge])

  // Editor style (of some codeCanvas) updated
  useEffect(() => {
    // Store the styles to localStorage
  }, [editorCanvasStyle])

  // Init draggable center divider
  useEffect(() => {
    drag('separator', separator, leftElement, rightElement)
  }, [separator])

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

  // ** setEditor **
  // const collectEditorData = (data, source, index = 0) => {
  //   // Combine data from all sources: playground, variable, function, object
  // }
  const relocateBlock = (x1, y1, x2, y2, source, index = 0) => {
    setEditor(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))
      let thisBlocks
      if (source === 'playground') thisBlocks = newState.playground.blocks
      else thisBlocks = newState.factory[source][index].blocks

      if (!thisBlocks[y2]) thisBlocks[y2] = {}
      thisBlocks[y2][x2] = {
        ...thisBlocks[y1][x1],
      }
      delete thisBlocks[y1][x1]
      if (thisBlocks[y1] === {}) delete thisBlocks[y1]

      // Remap outputs' inputs, and inputs' outputs
      if (thisBlocks[y2][x2].output)
        // i = "0", "1"...
        for (let i in thisBlocks[y2][x2].output)
          if (thisBlocks[y2][x2].output[i] !== null) {
            const thisOutput = thisBlocks[y2][x2].output[i]
            const childBlock = thisBlocks[thisOutput[0]][thisOutput[1]]
            childBlock.input[thisOutput[2]] = [y2, x2, parseInt(i)]
          }
      if (thisBlocks[y2][x2].input)
        for (let i in thisBlocks[y2][x2].input)
          if (thisBlocks[y2][x2].input[i] !== null) {
            const thisInput = thisBlocks[y2][x2].input[i]
            const parentBlock = thisBlocks[thisInput[0]][thisInput[1]]
            parentBlock.output[thisInput[2]] = [y2, x2, parseInt(i)]
          }

      return newState
    })
  }

  // ** setEditorCanvasStyle **
  const collectEditorCanvasStyle = (data, source, index = 0) => {
    setEditorCanvasStyle(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))
      if (source === 'playground') newState[source] = data
      else newState.factory[source][index] = data

      return newState
    })
  }

  const addSection = type => {
    const toAdd = JSON.parse(nativeSectionDataToAdd), // Data
      toAddStyle = JSON.parse(nativeSectionStyleToAdd) // Style

    toAdd.type = type

    setEditor(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) // Deep copy
      newState.factory[type].push(toAdd)
      return newState
    })

    setEditorCanvasStyle(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState))
      newState.factory[type].push(toAddStyle)
      return newState
    })
  }

  const collectFunctions = {
    relocate: relocateBlock,
  }

  return (
    <div id="editor" className="split">
      <div ref={leftElement} id="editor-left">
        <Playground
          data={editor.playground}
          canvasStyle={editorCanvasStyle.playground}
          collect={collectFunctions}
          collectStyle={collectEditorCanvasStyle}
        />
      </div>

      {/* Separator here */}
      <div ref={separator} className="separator"></div>

      <div ref={rightElement} id="editor-right">
        <div className="header">
          <div className="toolbarIcon settings">
            <img src={Settings} alt="Settings" />
          </div>
          <div className="toolbarIcon file">
            <img src={File} alt="File" />
          </div>
          <div className="toolbarIcon share">
            <img src={Share} alt="Share" />
            {/* <Emoji emoji="🔗" label="Share" /> */}
          </div>
          <a
            href="https://github.com/peilingjiang/b5"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img id="logo" src={Logo} alt="b5" />
          </a>
        </div>
        <div id="factory">
          {/* Variables Functions Objects */}
          <Factory
            data={editor.factory}
            canvasStyle={editorCanvasStyle.factory}
            addSection={addSection}
            collect={collectFunctions}
            collectStyle={collectEditorCanvasStyle}
          />
          <div className="shadow"></div>
        </div>
      </div>
    </div>
  )
}

// A section template to add to each tab
const nativeSectionData = {
    name: '',
    removable: true,
    type: '' /* Modify before adding... */,
    /*
  type should always be 'variable', 'function', and 'object'
  (w/out 's'!) in the data object and passed along the functions
  */
    lineStyles: {},
    blocks: {},
  },
  nativeSectionStyle = {
    left: lineNumberWidth,
    top: blockAlphabetHeight,
    scale: factoryCanvasDefaultScale,
    sectionHeight: sectionHeightDefault,
  }
const nativeSectionDataToAdd = JSON.stringify(nativeSectionData),
  nativeSectionStyleToAdd = JSON.stringify(nativeSectionStyle)

export default Editor
