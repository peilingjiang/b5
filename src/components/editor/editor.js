import React, { useRef, useEffect } from 'react'

import { drag } from '../main'
import { CodeCanvas } from '../codeCanvas/codeCanvas'
import Tabs from '../tabs/tabs'
import '../../postcss/components/editor/editor.css'

import Logo from '../../img/logo/logo-original.svg'
import Settings from '../../img/toolbar-icon/settings.png'
import File from '../../img/toolbar-icon/file.png'
import Share from '../../img/toolbar-icon/share.png'

const Editor = () => {
  const leftElement = useRef(),
    rightElement = useRef(),
    separator = useRef()
  useEffect(() => {
    drag('separator', separator, leftElement, rightElement)
  }, [separator])

  return (
    <div id="editor" className="split">
      <div ref={leftElement} id="editor-left">
        <div id="playground">
          <CodeCanvas maxLineCount={199} maxBlockCount={9} />
          <div className="shadow"></div>
        </div>
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
          <Tabs />
          <div className="shadow"></div>
        </div>
      </div>
    </div>
  )
}

export default Editor
