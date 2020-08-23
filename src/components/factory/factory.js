import React, { Component } from 'react'

import { Tab, TabContent } from './factoryFrags'
import '../../postcss/components/factory/factory.css'

export default class Factory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'variables',
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

  addSectionWrapper() {
    this.props.addSection(this.state.activeTab.slice(0, -1))
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state
  }

  render() {
    const {
        allTabs,
        onClickTab,
        state: { activeTab },
      } = this,
      a = activeTab.slice(0, -1)
    const { collect, collectStyle } = this.props

    return (
      <>
        <ol
          ref={e => (this.tabList = e)}
          id="tabList"
          className={'active' + a.charAt(0).toUpperCase() + a.slice(1)}
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
          type={a} // Remove 's'
          data={this.props.data[a]} // Array of objects
          canvasStyle={this.props.canvasStyle[a]}
          addSection={this.addSectionWrapper.bind(this)}
          collect={collect}
          collectStyle={collectStyle}
        />
      </>
    )
  }
}
