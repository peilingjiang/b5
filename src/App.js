import React from 'react'

import Editor from './components/editor/editor'
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
