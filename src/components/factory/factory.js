import React, { PureComponent } from 'react'

import { color } from '../constants'
import Block from '../block/block'
import CodeCanvas from '../codeCanvas/codeCanvas'
import '../../postcss/components/factory/factory.css'

const canvasSizes = {
  variables: [3, 3], // maxLineCount, maxBlockCount
  functions: [199, 19],
  objects: [49, 9],
}

class TabContent extends PureComponent {
  handleAddSection = () => {}
  render() {
    const { type, data } = this.props
    return (
      <div id="tabContent">
        {data.map((d, ind) => {
          return (
            <div key={type + ind} className={'section ' + type + 'Section'}>
              <Block type={type} data={d} />
              <div className="codeCanvasHolder">
                <CodeCanvas
                  data={d}
                  maxLineCount={canvasSizes[type][0]}
                  maxBlockCount={canvasSizes[type][1]}
                />
              </div>
            </div>
          )
        })}
        <button className={type} onClick={this.handleAddSection}>
          add
        </button>
      </div>
    )
  }
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
            name: 'cnv',
            removable: false,
            type: 'variable',
            lineStyle: {},
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
