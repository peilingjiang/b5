import React, { Component } from 'react'
import equal from 'react-fast-compare'

import { TabList, TabContent } from './factoryFrags'
import '../../postcss/components/factory/factory.css'

export default class Factory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'variable',
    }
    /*
    All data from each tab of the factory will be stored here as a whole.
    Including { lineStyles, blocks } from all codeCanvas of each section
    from each tab.
    */
    this.allTabs = ['variable', 'function', 'object']
  }

  onClickTab = tab => {
    this.setState({ activeTab: tab })
  }

  addSectionWrapper() {
    this.props.addSection(this.state.activeTab)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !equal(nextProps, this.props) || !equal(nextState, this.state)
  }

  render() {
    const {
      allTabs,
      onClickTab,
      state: { activeTab },
    } = this

    const { collect, collectStyle, separatorRef } = this.props

    return (
      <>
        <TabList
          allTabs={allTabs}
          onClickTab={onClickTab}
          activeTab={activeTab}
        />

        <TabContent
          type={activeTab}
          data={this.props.data[activeTab]} // Array of objects
          canvasStyle={this.props.canvasStyle[activeTab]}
          addSection={this.addSectionWrapper.bind(this)}
          collect={collect}
          collectStyle={collectStyle}
        />

        <div ref={separatorRef} className="separator"></div>
      </>
    )
  }
}
