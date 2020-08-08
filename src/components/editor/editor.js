import React, { useRef, useEffect, useState } from 'react'

import { drag } from '../main'
import { lineNumberWidth, blockAlphabetHeight } from '../constants'
import CodeCanvas from '../codeCanvas/codeCanvas'
import Factory from '../factory/factory'
import '../../postcss/components/editor/editor.css'

import Logo from '../../img/logo/logo-original.svg'
import Settings from '../../img/toolbar-icon/settings.png'
import File from '../../img/toolbar-icon/file.png'
import Share from '../../img/toolbar-icon/share.png'

const Playground = ({ collect }) => {
  const [playground, setPlayground] = useState({
    data: {
      lineStyle: {},
      blocks: {},
    },
    canvasStyle: {
      left: lineNumberWidth,
      top: blockAlphabetHeight,
      scale: 1,
    },
  })

  useEffect(() => {
    collect('playground', playground)
  }, [playground, collect])

  return (
    <div id="playground">
      <CodeCanvas maxLineCount={199} maxBlockCount={9} />
      <div className="shadow"></div>
    </div>
  )
}

const Editor = () => {
  const [editor, setEditor] = useState({
    playground: {},
    variable: [],
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
        <Playground collect={collectEditorData} />
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
          <Factory collect={collectEditorData} />
          <div className="shadow"></div>
        </div>
      </div>
    </div>
  )
}

export default Editor
