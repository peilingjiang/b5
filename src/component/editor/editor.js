import React, { useRef, useEffect } from 'react'

import { drag } from '../main'
import '../../postcss/component/editor/editor.css'

import logo from '../../img/logo/logo-original.svg'
import settings from '../../img/toolbarIcon/settings.svg'
import file from '../../img/toolbarIcon/file.svg'
import share from '../../img/toolbarIcon/share.svg'

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
        <div id="playground"></div>
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
          <img id="logo" src={logo} alt="b5" />
        </div>
        <div id="factory"></div>
      </div>
    </div>
  )
}

export default Editor
