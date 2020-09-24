import React, { useRef, useState, useEffect } from 'react'
import { saveAs } from 'file-saver'

import B5Wrapper from './b5Wrapper'
import { IconList } from '../headers/headers'
import { headerHeight, targetSize } from '../constants'
import '../../postcss/components/viewer/viewer.css'

import ViewerNoLoop from '../../img/icon/viewerNoLoop.svg'

const Viewer = ({ data }) => {
  const [loop, setLoop] = useState(true) // Render the canvas or not
  let toggle = useRef(true) // true if toggleLoop, false if refreshCanvas

  const viewer = useRef(),
    viewerHeader = useRef()

  const miniRef = useRef(),
    expandRef = useRef()

  useEffect(() => {
    if (!toggle.current) {
      // Refresh canvas instead of toggle
      toggle.current = true
      setLoop(true)
    }
  }, [loop])

  const toggleLoop = () => {
    toggle.current = true
    setLoop(!loop)
  }

  const refreshCanvas = () => {
    // Toggle twice...
    toggle.current = false
    setLoop(false)
  }

  const captureCanvas = () => {
    // p5 default canvas id - defaultCanvas0
    const canvas = document.getElementById('defaultCanvas0')
    if (canvas)
      canvas.toBlob(blob => {
        saveAs(blob, 'myCanvas.png')
      }, 'image/png')
  }

  const _moveViewer = e => {
    e.preventDefault()
    const viewerCurrent = viewer.current,
      winWidth = window.innerWidth,
      winHeight = window.innerHeight

    viewerHeader.current.className = 'header grabbing'

    const viewerBox = viewerCurrent.getBoundingClientRect()
    const mouseDown = {
      e,
      offsetLeft: viewerBox.left,
      offsetTop: viewerBox.top,
    }

    const _dragViewer = e => {
      let delta = {
        x: e.clientX - mouseDown.e.clientX,
        y: e.clientY - mouseDown.e.clientY,
      }
      viewerCurrent.style.left =
        Math.max(
          Math.min(mouseDown.offsetLeft + delta.x, winWidth - headerHeight),
          -viewerBox.width + headerHeight
        ) + 'px'
      viewerCurrent.style.top =
        Math.max(
          Math.min(mouseDown.offsetTop + delta.y, winHeight - headerHeight),
          0
        ) + 'px'
    }

    document.addEventListener('mousemove', _dragViewer, true)
    document.addEventListener('mouseup', function _listener() {
      viewerHeader.current.className = 'header grab'
      document.removeEventListener('mousemove', _dragViewer, true)
      document.removeEventListener('mouseup', _listener, true)
    })
  }

  useEffect(() => {
    const viewerHeaderCurrent = viewerHeader.current

    viewerHeaderCurrent.addEventListener('mousedown', _moveViewer, true)
    return () => {
      viewerHeaderCurrent.removeEventListener('mousedown', _moveViewer, true)
    }
  }, [viewerHeader])

  const handleMinimize = e => {
    viewer.current.classList.replace('popup', 'miniDown')

    const canvas = document.getElementById('defaultCanvas0')
    const viewerCanvas = document.getElementById('viewerCanvas')

    // TODO: ResizeObserver
    const targetScale = Math.min(
      targetSize / canvas.offsetHeight,
      targetSize / canvas.offsetWidth
    )

    viewerCanvas.style = `
      transform: scale(${targetScale})
    `

    viewer.current.style = `
      width: ${viewerCanvas.offsetWidth * targetScale}px;
      height: ${viewerCanvas.offsetHeight * targetScale}px;
    `
  }

  const handleExpand = e => {
    viewer.current.classList.replace('miniDown', 'popup')

    const viewerCanvas = document.getElementById('viewerCanvas')
    viewerCanvas.style = `
      transform: unset
    `
    viewer.current.style = `
      width: auto;
      height: auto;
    `
  }

  useEffect(() => {
    const mRC = miniRef.current
    const eRC = expandRef.current
    mRC.addEventListener('click', handleMinimize)
    eRC.addEventListener('click', handleExpand)
    return () => {
      mRC.removeEventListener('click', handleMinimize)
      eRC.removeEventListener('click', handleExpand)
    }
  }, [miniRef, expandRef])

  return (
    <div ref={viewer} id="viewer" className="viewer popup">
      {/* popup is the default status of the viewer window */}
      <div ref={viewerHeader} className="header grab">
        <IconList
          iconsName={[loop ? 'NoLoop' : 'Loop', 'Refresh', 'Capture']}
          iconsOnClickFunc={[toggleLoop, refreshCanvas, captureCanvas]}
          iconsDisabled={[false, !loop, !loop]}
        />

        {/* Minimize */}
        <div ref={miniRef} className="mini"></div>
      </div>
      {loop ? (
        <B5Wrapper data={data} />
      ) : (
        <img
          className="viewerNoLoop"
          src={ViewerNoLoop}
          alt="The canvas is paused."
        />
      )}

      {/* Expander */}
      <div className="expandBackground"></div>
      <div ref={expandRef} className="expand"></div>
    </div>
  )
}

export default Viewer
