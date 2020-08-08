import React, { useRef, useEffect, useState, Component } from 'react'

import { drag } from '../main'
import {
  lineNumberWidth,
  blockAlphabetHeight,
  factoryCanvasDefaultScale,
} from '../constants'
import CodeCanvas from '../codeCanvas/codeCanvas'
import Factory from '../factory/factory'
import '../../postcss/components/editor/editor.css'

import Logo from '../../img/logo/logo-original.svg'
import Settings from '../../img/toolbar-icon/settings.png'
import File from '../../img/toolbar-icon/file.png'
import Share from '../../img/toolbar-icon/share.png'

class Playground extends Component {
  constructor(props) {
    super(props)
    const { data, canvasStyle, collect } = props
    this.state = {
      data: data,
      canvasStyle: canvasStyle,
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state
  }

  render() {
    return (
      <div id="playground">
        <CodeCanvas
          maxLineCount={199}
          maxBlockCount={9}
          data={this.state.data}
          canvasStyle={this.state.canvasStyle}
        />
        <div className="shadow"></div>
      </div>
    )
  }
}

const Editor = () => {
  const [editor, setEditor] = useState({
    playground: {
      data: {
        type: 'playground',
        lineStyles: {},
        blocks: {},
      },
      canvasStyle: {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: 1,
      },
    },
    variable: [
      {
        /* --- data --- */
        data: {
          name: 'cnv' /* For the section/constructed block */,
          removable: false /* Can we delete the section? */,
          type: 'variable' /* What is the type of the customized block? */,
          lineStyles: {} /* lineStyles */,
          blocks: {
            /* blocks */
            '0': {
              /* Line number - start from 0 */
              '0': {
                /* Column number - start from 0 */ name: 'number',
                input: null,
                data: [500],
              },
              '1': {
                name: 'numberSlider',
                input: null,
                data: [500, 0, 2000, 10],
              },
            },
            '1': {
              '0': {
                name: 'createCanvas',
                input: [
                  [0, 0, 0] /* Line number, column number, index of the node */,
                  [0, 1, 0],
                ],
                data: null,
              },
            },
          },
        },
        /* --- canvasStyle --- */
        canvasStyle: {
          left: lineNumberWidth,
          top: blockAlphabetHeight,
          scale: factoryCanvasDefaultScale,
          /* TODO: Add section height? */
        },
      },
    ],
    function: [],
    object: [],
  })

  const leftElement = useRef(),
    rightElement = useRef(),
    separator = useRef()

  // Editor updated
  useEffect(() => {
    console.log(editor)
  }, [editor])

  useEffect(() => {
    drag('separator', separator, leftElement, rightElement)
  }, [separator])

  /*

  > editor
  {
    playground: {
      data: {
        // name: 'playground',
        // removable: false,
        // type: 'playground',
        lineStyle: {},
        blocks: {},
      },
      canvasStyle: {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: 1,
      },
    },
    variable: [],
    function: [],
    object: [],
  }

  */

  const collectEditorData = (source, data) => {
    // Combine data from all sources: playground, variable, function, object
    setEditor(prevState => {
      if (prevState[source] !== data) {
        let newState = JSON.parse(JSON.stringify(prevState))
        newState[source] = data
        return newState
      } else {
        return prevState
      }
    })
  }

  return (
    <div id="editor" className="split">
      <div ref={leftElement} id="editor-left">
        <Playground
          data={editor.playground.data}
          canvasStyle={editor.playground.canvasStyle}
          collect={collectEditorData}
        />
      </div>

      {/* Separator here */}
      <div ref={separator} className="separator"></div>

      <div ref={rightElement} id="editor-right">
        <div id="header">
          <div className="toolbarIcon settings">
            <img src={Settings} alt="Settings" />
          </div>
          <div className="toolbarIcon file">
            <img src={File} alt="File" />
          </div>
          <div className="toolbarIcon share">
            <img src={Share} alt="Share" />
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
            v={editor.variable}
            f={editor.function}
            o={editor.object}
            collect={collectEditorData}
          />
          <div className="shadow"></div>
        </div>
      </div>
    </div>
  )
}

export default Editor
