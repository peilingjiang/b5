import React, { useRef, useEffect } from 'react'

import { drag } from '../main'
import { CodeCanvas } from '../codeCanvas/codeCanvas'
import '../../postcss/components/editor/editor.css'

import logo from '../../img/logo/logo-original.svg'
import settings from '../../img/toolbarIcon/settings.png'
import file from '../../img/toolbarIcon/file.png'
import share from '../../img/toolbarIcon/share.png'

const Editor = () => {
  const leftElement = useRef(),
    rightElement = useRef(),
    separator = useRef()
  useEffect(() => {
    drag('separator', separator, leftElement, rightElement)
  }, [separator])

  return (
    <div className="split">
      <div ref={leftElement} id="editor-left">
        <div id="playground">
          <CodeCanvas />
        </div>
      </div>

      <div ref={separator} className="separator"></div>

      <div ref={rightElement} id="editor-right">
        <div id="header">
          <div className="toolbarIcon settings">
            <img src={settings} alt="Settings" />
          </div>
          <div className="toolbarIcon file">
            <img src={file} alt="File" />
          </div>
          <div className="toolbarIcon share">
            <img src={share} alt="Share" />
          </div>
          <a
            href="https://github.com/peilingjiang/b5"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img id="logo" src={logo} alt="b5" />
          </a>
        </div>
        <div id="factory"></div>
      </div>
    </div>
  )
}

export default Editor
