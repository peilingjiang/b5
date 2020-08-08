import React, { PureComponent, useEffect, useRef } from 'react'

import { color, lineNumberWidth, blockAlphabetHeight } from '../constants'
import Block from '../block/block'
import CodeCanvas from '../codeCanvas/codeCanvas'
import '../../postcss/components/factory/factory.css'

const factoryCanvasDefaultScale = 1
const canvasSizes = {
  variable: [3, 3], // maxLineCount, maxBlockCount
  function: [199, 19],
  object: [49, 9],
}

// A section template to add to each tab
const nativeSection = {
  data: {
    name: '',
    removable: true,
    type: '' /* Modify before adding... */,
    /*
    type should always be 'variable', 'function', and 'object'
    (w/out 's'!) in the data object and passed along the functions
    */
    lineStyles: {},
    blocks: {},
  },
  canvasStyle: {
    left: lineNumberWidth,
    top: blockAlphabetHeight,
    scale: factoryCanvasDefaultScale,
  },
}
const nativeSectionToAdd = JSON.stringify(nativeSection) // Deep copy

// A single section for each tab content component

const TabSection = ({ type, data, canvasStyle }) => {
  const sectionRef = useRef(),
    sectionResizeRef = useRef()

  const handleDrag = e => {
    e.preventDefault()
    let mouseDown = {
      e,
      sectionHeight: sectionRef.current.clientHeight,
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

  useEffect(() => {
    const effectSectionResizeRef = sectionResizeRef.current
    if (effectSectionResizeRef)
      effectSectionResizeRef.addEventListener('mousedown', handleDrag, true)
    return () => {
      effectSectionResizeRef.removeEventListener('mousedown', handleDrag, true)
    }
  }, [])

  return (
    <div ref={sectionRef} className={'section ' + type + 'Section'}>
      <Block type={type} data={data} />
      <div className="codeCanvasHolder">
        <CodeCanvas
          data={data}
          canvasStyle={canvasStyle}
          maxLineCount={canvasSizes[type][0]}
          maxBlockCount={canvasSizes[type][1]}
        />
      </div>
      {/* Bottom draggable side for resizing */}
      <div ref={sectionResizeRef} className="sectionResizeBar"></div>
    </div>
  )
}

// Content component for each tab

const TabContent = ({ type, data, addSection }) => {
  const handleAddSection = () => {
    addSection(type)
  }

  return (
    <div id="tabContent">
      {data.map((d, ind) => {
        return (
          <TabSection
            key={type + ind}
            type={type}
            data={d.data}
            canvasStyle={d.canvasStyle}
          />
        )
      })}
      <button className={type} onClick={handleAddSection}>
        add
      </button>
    </div>
  )
}

class Tab extends PureComponent {
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

export default class Factory extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'variables',
      data: {
        variable: [
          {
            /* --- data --- */
            data: {
              name: 'cnv' /* For the section/constructed block */,
              removable: false /* Can we delete the section? */,
              type: 'variable' /* What is the type of the customized block? */,
              lineStyles: {} /* lineStyles */,
              blocks: {
                /* blocks */
                '0': {
                  /* Line number - start from 0 */
                  '0': {
                    /* Column number - start from 0 */ name: 'number',
                    input: null,
                    data: [500],
                  },
                  '1': {
                    name: 'numberSlider',
                    input: null,
                    data: [500, 0, 2000, 10],
                  },
                },
                '1': {
                  '0': {
                    name: 'createCanvas',
                    input: [
                      [
                        0,
                        0,
                        0,
                      ] /* Line number, column number, index of the node */,
                      [0, 1, 0],
                    ],
                    data: null,
                  },
                },
              },
            },
            /* --- canvasStyle --- */
            canvasStyle: {
              left: lineNumberWidth,
              top: blockAlphabetHeight,
              scale: factoryCanvasDefaultScale,
              /* TODO: Add section height? */
            },
          },
        ],
        function: [],
        object: [],
      },
    }
    /*
    All data from each tab of the factory will be stored here as a whole.
    Including { lineStyles, blocks } from all codeCanvas of each section
    from each tab.
    */
    this.allTabs = ['variables', 'functions', 'objects']
  }

  onClickTab = tab => {
    this.setState({ activeTab: tab })
  }

  addSection(type) {
    this.setState(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) // Deep copy
      const toAdd = JSON.parse(nativeSectionToAdd)
      toAdd.data.type = type
      newState.data[type].push(toAdd)
      return newState
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTab, data } = this.state,
      a = activeTab.slice(0, -1) // remove 's' from activeTab

    if (prevState.data[a] !== data[a])
      this.props.collect(
        a /* source - variable, function, object */,
        data[a] /* data */
      )
  }

  render() {
    const {
      allTabs,
      onClickTab,
      state: { activeTab },
    } = this

    return (
      <>
        <ol
          ref={e => (this.tabList = e)}
          id="tabList"
          style={{
            borderBottom: '2px solid ' + color[activeTab.slice(0, -1)], // remove 's'
          }}
        >
          {allTabs.map(tab => {
            return (
              <Tab
                key={tab}
                label={tab}
                active={activeTab === tab}
                onClick={onClickTab}
              />
            )
          })}
        </ol>
        <TabContent
          type={activeTab.slice(0, -1)} // Remove 's'
          data={this.state.data[activeTab.slice(0, -1)]}
          addSection={this.addSection.bind(this)}
        />
        {/* data - array of section objects */}
      </>
    )
  }
}
