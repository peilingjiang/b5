import React, { PureComponent, useEffect, useRef } from 'react'

import { color } from '../constants'
import Block from '../block/block'
import CodeCanvas from '../codeCanvas/codeCanvas'
import '../../postcss/components/factory/factory.css'

const factoryCanvasDefaultScale = 0.9
const canvasSizes = {
  variables: [3, 3], // maxLineCount, maxBlockCount
  functions: [199, 19],
  objects: [49, 9],
}

const TabSection = ({ type, data }) => {
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
          maxLineCount={canvasSizes[type][0]}
          maxBlockCount={canvasSizes[type][1]}
        />
      </div>
      <div ref={sectionResizeRef} className="sectionResizeBar"></div>
    </div>
  )
}

const TabContent = ({ type, data }) => {
  const handleAddSection = () => {}

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
  onClick = () => {
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
        variables: [
          {
            data: {
              name: 'cnv',
              removable: false,
              type: 'variable',
              lineStyles: {},
              blocks: {
                '0': {
                  '0': {
                    name: 'number',
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
                      [0, 0, 0],
                      [0, 1, 0],
                    ],
                    data: null,
                  },
                },
              },
            },
            canvasStyle: {
              left: 0,
              top: 0,
              scale: factoryCanvasDefaultScale,
            },
          },
        ],
        functions: [],
        objects: [],
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
        <TabContent type={activeTab} data={this.state.data[activeTab]} />{' '}
        {/* data - array of section objects */}
      </>
    )
  }
}
