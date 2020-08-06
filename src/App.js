import React from 'react'

import Editor from './components/editor/editor'
import Viewer from './components/viewer/viewer'
import './postcss/css/main.css'

// const LOCAL_TODO_KEY = 'todoApp.todos'

function App() {
  return (
    <>
      <Editor />
      <Viewer />
    </>
  )
}

export default App
