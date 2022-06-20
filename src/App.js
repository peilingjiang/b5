import { useState } from 'react'

import Editor from './components/editor/editor.js'
import Viewer from './components/viewer/viewer.js'
import './postcss/css/main.css'

function App() {
  const [data, setData] = useState({}) // Must be {}

  const bridgeData = data => {
    // Send data from Editor to Viewer
    setData(data)
  }

  return (
    <>
      <Editor bridge={bridgeData} />
      <Viewer data={data} />
    </>
  )
}

export default App
