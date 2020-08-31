import React, { Component } from 'react'
import equal from 'react-fast-compare'

import _b5Search from './blockSearchBase'
import * as method from './blockSearchMethod'
import '../../postcss/components/blockSearch/blockSearch.css'
import BlockRendererLite from '../blockRenderer/blockRendererLite'

export default class BlockSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: null,
    }

    this.inputTimeout = null
  }
  componentDidMount() {
    _b5Search.update()
    document.addEventListener('mousedown', this.searchingMouseDown)
    this.inputRef.focus()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.searchingMouseDown)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !equal(nextState.result, this.state.result)
  }

  searchingMouseDown = e => {
    if (!method.hoveringOnSearchBar(e.target)) {
      this.props.breakSearch()
      return
    }
    const mouse = {
      x: e.clientX,
      y: e.clientY,
      top: this.blockSearch.offsetTop,
      left: this.blockSearch.offsetLeft,
    }

    const handleDragSearchBar = method.dragSearchBar.bind(this, {
      mouse: mouse,
      blockSearch: this.blockSearch,
    })
    document.addEventListener('mousemove', handleDragSearchBar)
    document.addEventListener('mouseup', function _listener() {
      document.removeEventListener('mousemove', handleDragSearchBar)
      document.removeEventListener('mouseup', _listener)
    })
  }

  search = () => {
    this.setState({
      result:
        this.inputRef.value !== ''
          ? _b5Search.search(this.inputRef.value)
          : null,
    })
  }

  render() {
    return (
      <div className="blockSearchHolder">
        <div ref={e => (this.blockSearch = e)} className="blockSearch">
          <input
            ref={e => (this.inputRef = e)}
            className="searchInput"
            placeholder="search name, type, or description"
            onChange={this.search}
          />
          {this.state.result && <BlockList blocks={this.state.result} />}
        </div>
      </div>
    )
  }
}

const BlockList = ({ blocks }) => {
  return (
    <div className="blockList">
      {blocks.map((b, i) => {
        return (
          <BlockRendererLite
            key={'blockList ' + b.item.name + i}
            name={b.item.name}
            source={b.item.source}
          />
        )
      })}
    </div>
  )
}
