import React, { PureComponent, useEffect, useRef } from 'react'

import BlockPreview from '../blockPreview/blockPreview'
import CodeCanvas from '../codeCanvas/codeCanvas'

const canvasSizes = {
  variable: [3, 3], // maxLineCount, maxBlockCount
  function: [199, 19],
  object: [49, 9],
}

// A single section for each tab content component

const TabSection = ({
  type,
  index,
  data,
  canvasStyle,
  collect,
  collectStyle,
}) => {
  const sectionRef = useRef(),
    sectionResizeRef = useRef()

  const handleDrag = e => {
    e.preventDefault()
    let mouseDown = {
      e,
      sectionHeight: sectionRef.current.offsetHeight,
    }

    const handleSectionResize = e => {
      let deltaY = e.clientY - mouseDown.e.clientY // Min and Max height set in CSS
      sectionRef.current.style.height = mouseDown.sectionHeight + deltaY + 'px'
    }

    const tabView = sectionRef.current.parentElement // tabContent element
    tabView.addEventListener('mousemove', handleSectionResize, true)
    tabView.addEventListener(
      'mouseup',
      function _listener() {
        tabView.removeEventListener('mousemove', handleSectionResize, true)
        tabView.removeEventListener('mouseup', _listener, true)
      },
      true
    )
  }

  const collectStyleWrapper = (source, data) => {
    /* Use offsetHeight to include border width */
    collectStyle(
      source,
      { ...data, sectionHeight: sectionRef.current.offsetHeight }, // Shallow copy as data is one-level object here
      index
    )
  }

  useEffect(() => {
    const effectSectionResizeRef = sectionResizeRef.current
    effectSectionResizeRef.addEventListener('mousedown', handleDrag, true)
    return () => {
      effectSectionResizeRef.removeEventListener('mousedown', handleDrag, true)
    }
  }, [sectionResizeRef])

  // Init sectionHeight
  useEffect(() => {
    if (sectionRef.current.offsetHeight !== canvasStyle.sectionHeight) {
      sectionRef.current.style.height = canvasStyle.sectionHeight + 'px'
    }
  }, [sectionRef, canvasStyle])

  return (
    <div ref={sectionRef} className={'section ' + type + 'Section'}>
      <BlockPreview type={type} data={data} />
      <div className="codeCanvasHolder">
        <CodeCanvas
          data={data}
          canvasStyle={canvasStyle}
          maxLineCount={canvasSizes[type][0]}
          maxBlockCount={canvasSizes[type][1]}
          collect={collect}
          collectStyle={collectStyleWrapper}
        />
      </div>
      {/* Bottom draggable side for resizing */}
      <div ref={sectionResizeRef} className="sectionResizeBar"></div>
    </div>
  )
}

// Content component for each tab

export const TabContent = ({
  type,
  data,
  canvasStyle,
  addSection,
  collect,
  collectStyle,
}) => {
  const handleAddSection = () => {
    addSection(type)
  }

  return (
    <div id="tabContent">
      {data.map((d, ind) => {
        return (
          <TabSection
            key={type + ind}
            index={ind}
            type={type}
            data={d}
            canvasStyle={
              canvasStyle[ind]
            } /* data and canvasStyle items should always have the same index */
            collect={collect}
            collectStyle={collectStyle}
          />
        )
      })}
      <button className={type} onClick={handleAddSection}>
        add
      </button>
    </div>
  )
}

export class Tab extends PureComponent {
  // labels are 'variables', 'functions', and 'objects' (w/ s!)

  onClick = () => {
    // Switch Tab
    const { label, onClick } = this.props
    onClick(label)
  }

  render() {
    return (
      <li
        className={
          'tab ' + this.props.label + (this.props.active ? ' activeTab' : '')
        }
        onClick={this.onClick}
      >
        {this.props.label}
      </li>
    )
  }
}
