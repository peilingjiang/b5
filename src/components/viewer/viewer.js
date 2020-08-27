import React, { useRef, useState, useEffect } from 'react'

import B5Wrapper from './b5Wrapper'
import { IconList } from '../headers'
import '../../postcss/components/viewer/viewer.css'

import ViewerNoLoop from '../../img/icon/viewerNoLoop.svg'

const Viewer = ({ data }) => {
  const [loop, setLoop] = useState(true) // Render the canvas or not

  const viewer = useRef(),
    viewerHeader = useRef()

  const toggleLoop = () => {
    setLoop(!loop)
  }

  useEffect(() => {
    const viewerHeaderCurrent = viewerHeader.current

    const _moveViewer = e => {
      const viewerCurrent = viewer.current,
        winWidth = window.innerWidth,
        winHeight = window.innerHeight

      viewerHeaderCurrent.className = 'header grabbing'

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
            Math.min(mouseDown.offsetLeft + delta.x, winWidth - 48),
            -viewerBox.width + 48
          ) + 'px'
        viewerCurrent.style.top =
          Math.max(Math.min(mouseDown.offsetTop + delta.y, winHeight - 48), 0) +
          'px'
      }

      document.addEventListener('mousemove', _dragViewer, true)
      document.addEventListener('mouseup', function _listener() {
        viewerHeaderCurrent.className = 'header grab'
        document.removeEventListener('mousemove', _dragViewer, true)
        document.removeEventListener('mouseup', _listener, true)
      })
    }

    viewerHeaderCurrent.addEventListener('mousedown', _moveViewer, true)
    return () => {
      viewerHeaderCurrent.removeEventListener('mousedown', _moveViewer, true)
    }
  }, [viewerHeader])

  return (
    <div ref={viewer} id="viewer" className="viewer popup">
      {/* popup is the default status of the viewer window */}
      <div ref={viewerHeader} className="header grab">
        <IconList
          iconsName={[loop ? 'NoLoop' : 'Loop']}
          onClickFunc={[toggleLoop]}
        />
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
    </div>
  )
}

export default Viewer
