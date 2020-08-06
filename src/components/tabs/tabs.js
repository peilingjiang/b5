import React, { Component } from 'react'

import { color } from '../constants'
import '../../postcss/components/tabs/tabs.css'

const canvasSizes = {
  variables: [2, 3],
  functions: [19, 199],
  objects: [9, 49]
}

class TabContent extends Component {
  render() {
    return <></>
  }
}

class Tab extends Component {
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

export default class Tabs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'variables',
      variables: {},
      functions: {},
      objects: {},
    }
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
      <div id="tabs">
        <ol ref={e => (this.tabList = e)} id="tabList" style={{
          borderBottom: '2px solid ' + color[activeTab.slice(0, -1)]
        }}>
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
        <TabContent data={this.state[activeTab]} />
      </div>
    )
  }
}
