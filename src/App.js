import React, { useState } from 'react'

import Editor from './components/editor/editor'
import Viewer from './components/viewer/viewer'
import './postcss/css/main.css'

function App() {
  const [data, setData] = useState({}) // Must be {}

  const bridgeData = d => {
    // Send data from Editor to Viewer
    setData(d)
  }

  return (
    <>
      <Editor bridge={bridgeData} />
      <Viewer data={data} />
    </>
  )
}

export default App
