import React, { Component, PureComponent, useEffect, useRef } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

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

    // const tabView = sectionRef.current.parentElement // tabContent element
    // Listen to the whole document
    document.addEventListener('mousemove', handleSectionResize, true)
    document.addEventListener(
      'mouseup',
      function _listener() {
        document.removeEventListener('mousemove', handleSectionResize, true)
        document.removeEventListener('mouseup', _listener, true)
      },
      true
    )
  }

  // setEditor functions...
  const collectWrapper = (...args) => {
    // args - x1, y1, x2, y2, source
    collect(...args, index)
  }

  const collectStyleWrapper = (data, source) => {
    /* Use offsetHeight to include border width */
    collectStyle(
      { ...data, sectionHeight: sectionRef.current.offsetHeight }, // Shallow copy as data is one-level object here
      source,
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
      <div className="codeCanvasHolder">
        <CodeCanvas
          data={data}
          canvasStyle={canvasStyle}
          maxLineCount={canvasSizes[type][0]}
          maxBlockCount={canvasSizes[type][1]}
          collect={collectWrapper}
          collectStyle={collectStyleWrapper}
        />
      </div>
      <BlockPreview type={type} data={data} source={'custom'} />
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
      <button className={'addButton ' + type} onClick={handleAddSection}>
        add
      </button>
    </div>
  )
}

export class Tab extends PureComponent {
  // labels are 'variable', 'function', and 'object' (w/out s!)
  onClick = () => {
    // Switch Tab
    const { label, onClick } = this.props
    onClick(label)
  }

  render() {
    const { label, enoughWidth, active } = this.props
    return (
      <li
        className={'tab ' + label + (active ? ' activeTab' : '')}
        onClick={this.onClick}
      >
        {enoughWidth ? label : label.slice(0, 3)}
      </li>
    )
  }
}

const _checkWidth = target => {
  // Check if the width of the TabList is enough
  // for displaying full names of tabs
  return target.offsetWidth > 267 ? true : false
}

export class TabList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      enoughWidth: true,
    }
  }

  componentDidMount() {
    this.setState({ enoughWidth: _checkWidth(this.tabList) }) // true (enough length) or false (too short)
    this.resizeObserver = new ResizeObserver(entries => {
      this.handleTabResize()
    })
    // Add ResizeObservers to tabs
    this.resizeObserver.observe(this.tabList)
  }

  componentWillUnmount() {
    this.resizeObserver.unobserve(this.tabList)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.activeTab !== this.props.activeTab ||
      nextState.enoughWidth !== this.state.enoughWidth
    )
  }

  handleTabResize = () => {
    this.setState({ enoughWidth: _checkWidth(this.tabList) })
  }

  render() {
    const { allTabs, onClickTab, activeTab } = this.props

    return (
      <ol
        ref={e => (this.tabList = e)}
        id="tabList"
        className={
          'active' + activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }
      >
        {allTabs.map(tab => {
          return (
            <Tab
              key={tab}
              label={tab}
              enoughWidth={this.state.enoughWidth}
              active={activeTab === tab}
              onClick={onClickTab}
            />
          )
        })}
      </ol>
    )
  }
}
