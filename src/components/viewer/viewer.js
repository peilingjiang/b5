import { useRef, useState, useEffect, useCallback } from 'react'
import { saveAs } from 'file-saver'

import B5Wrapper from './b5ViewerWrapper.js'
import { IconList } from '../headers/headers.js'
import { headerHeight, targetSize } from '../constants.js'
import { usePrevious } from '../useHooks.js'
import '../../postcss/components/viewer/viewer.css'

import ViewerNoLoop from '../../img/icons/viewerNoLoop.svg'

const Viewer = ({ data }) => {
  const [loop, setLoop] = useState(true) // Render the canvas or not
  let toggle = useRef(true) // true if toggleLoop, false if refreshCanvas

  const viewer = useRef(),
    viewerHeader = useRef()

  const canvasRef = useRef() // Going to viewerCanvas

  const miniStateRef = useRef(false)

  const prevData = usePrevious(data)
  useEffect(() => {
    if (
      miniStateRef.current &&
      prevData &&
      prevData.factory &&
      data.factory.variable !== prevData.factory.variable
    ) {
      _handleResize()
    }
  }, [data, prevData])

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

    viewerHeader.current.classList.replace('grab', 'grabbing')

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
      if (viewerHeader.current)
        viewerHeader.current.classList.replace('grabbing', 'grab')
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

  const _handleResize = () => {
    const canvas = document.getElementById('defaultCanvas0')

    const targetScale = Math.min(
      (targetSize / canvas.height) * 2,
      (targetSize / canvas.width) * 2
    )

    canvasRef.current.style = `transform: scale(${targetScale})`
    viewer.current.style = `width: ${
      (canvas.width / 2) * targetScale
    }px; height: ${(canvas.height / 2) * targetScale}px;`
  }

  // ! Mini
  const _handleMinimize = useCallback(
    e => {
      e.preventDefault()
      viewer.current.classList.replace('popup', 'miniDown')
      viewerHeader.current.classList.add('expandHeader')

      if (loop) {
        _handleResize()
        miniStateRef.current = true
      }
    },
    [loop]
  )

  const _handleExpand = useCallback(
    e => {
      viewer.current.classList.replace('miniDown', 'popup')
      miniStateRef.current = false

      if (loop) {
        const viewerCanvas = document.getElementById('viewerCanvas')
        viewerCanvas.style = `transform: unset`
        viewer.current.style = `width: auto; height: auto;`
      }

      if (viewerHeader.current)
        viewerHeader.current.classList.replace('grabbing', 'grab')
    },
    [loop]
  )

  return (
    <div ref={viewer} id="viewer" className="viewer popup">
      {/* popup is the default status of the viewer window */}
      <div ref={viewerHeader} className="header grab">
        <IconList
          iconsName={[loop ? 'NoLoop' : 'Loop', 'Refresh', 'Capture']}
          iconsOnClickFunc={[toggleLoop, refreshCanvas, captureCanvas]}
          iconsDisabled={[false, !loop, !loop]}
          functions={null}
        />

        {/* Minimize */}
        <div onClick={_handleMinimize} className="mini"></div>
        {/* Expander */}
        <div onClick={_handleExpand} className="expand"></div>
      </div>

      {loop ? (
        <B5Wrapper data={data} canvasRef={canvasRef} />
      ) : (
        <img
          id="viewerNoLoop"
          className="viewerNoLoop"
          src={ViewerNoLoop}
          alt="PAUSED"
        />
      )}
    </div>
  )
}

export default Viewer
