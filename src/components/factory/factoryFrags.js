import React, {
  Component,
  PureComponent,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
// import { v4 as uuidv4 } from 'uuid'

import { checkSectionNameNotValid } from './factoryMethod'
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
  section,
  collect,
  collectStyle,
  thisFactoryCodeCanvasRef,
  hardRefresh,
}) => {
  const sectionRef = useRef(),
    sectionResizeRef = useRef()
  const sectionControlsRef = useRef()
  const [renaming, setRenaming] = useState(false)

  const blockNameRef = useRef()

  const handleDrag = e => {
    e.preventDefault()
    let mouseDown = {
      e,
      sectionHeight: sectionRef.current.offsetHeight,
    }

    const handleSectionResize = e => {
      e.preventDefault()
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

  // ! Section CONTROLS
  const handleRename = useCallback(() => {
    setRenaming(true)
    blockNameRef.current.focus()
    document.addEventListener('mousedown', function _finishRenaming(e) {
      if (blockNameRef.current !== e.target) {
        setRenaming(false)
        document.removeEventListener('mousedown', _finishRenaming)
        // Upload rename
        if (
          !checkSectionNameNotValid(blockNameRef.current.innerText, data.name)
        ) {
          // innerText is valid
          section('rename', type, [index, blockNameRef.current.innerText])
        }
      }
    })
  }, [data.name, index, section, type])

  const handleSectionControls = useCallback(
    e => {
      // collect and section 'data' always in array format
      e.preventDefault()
      const l = e.target.classList
      if (l.contains('sectionDelete')) section('delete', type, [index])
      else if (l.contains('sectionRename')) {
        handleRename()
      }
    },
    [index, section, type, handleRename]
  )

  useEffect(() => {
    const sCRefCurrent = sectionControlsRef.current
    sCRefCurrent.addEventListener('mouseup', handleSectionControls)
    return () => {
      sCRefCurrent.removeEventListener('mouseup', handleSectionControls)
    }
  }, [handleSectionControls, sectionControlsRef])

  return (
    <div
      ref={sectionRef}
      className={'section ' + type + 'Section'}
      key={data.name + 'Section'}
    >
      <div className="codeCanvasHolder">
        <CodeCanvas
          data={data}
          canvasStyle={canvasStyle}
          maxLineCount={canvasSizes[type][0]}
          maxBlockCount={canvasSizes[type][1]}
          collect={collectWrapper}
          collectStyle={collectStyleWrapper}
          thisCodeCanvasRef={thisFactoryCodeCanvasRef}
          hardRefresh={hardRefresh}
        />
      </div>
      <BlockPreview
        type={type}
        data={data}
        source={'custom'}
        isRenaming={renaming}
        blockNameRef={blockNameRef}
      />
      {/* Bottom draggable side for resizing */}
      <div ref={sectionResizeRef} className="sectionResizeBar"></div>

      {/* Buttons */}
      <div className="sectionControls" ref={sectionControlsRef}>
        {/* Using mask in CSS to form style */}
        <div
          className="sectionRename sectionIcon"
          title="edit block name"
        ></div>
        <div className="sectionDelete sectionIcon" title="delete block"></div>
      </div>
    </div>
  )
}

// Content component for each tab

export const TabContent = ({
  type,
  data,
  canvasStyle,
  section,
  collect,
  collectStyle,
  factoryCodeCanvasRef,
  hardRefresh,
}) => {
  const handleAddSection = () => {
    section('add', type)
  }

  return (
    <div className={'tabContent ' + type + 'Content'}>
      {data.map((d, ind) => {
        return (
          <TabSection
            key={d.name}
            index={ind}
            type={type}
            data={d}
            canvasStyle={
              canvasStyle[ind]
            } /* data and canvasStyle items should always have the same index */
            section={section}
            collect={collect}
            collectStyle={collectStyle}
            thisFactoryCodeCanvasRef={factoryCodeCanvasRef[type][ind]}
            hardRefresh={hardRefresh}
          />
        )
      })}
      <button className="addButton" onClick={handleAddSection}>
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
