import React, { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Editor from './component/editor/editor'
import './postcss/css/main.css'

// const LOCAL_TODO_KEY = 'todoApp.todos'

function App() {
  return (
    <>
      <Editor />
      <div id="viewer"></div>
    </>
  )
}

export default App
