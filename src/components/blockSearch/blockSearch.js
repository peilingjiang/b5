import React, { Component, createRef, useEffect } from 'react'
import equal from 'react-fast-compare'

import _b5Search from './blockSearchBase'
import * as method from './blockSearchMethod'
import '../../postcss/components/blockSearch/blockSearch.css'
import BlockRendererLite from '../blockRenderer/blockRendererLite'
import { searchBarWidth } from '../constants'
import { _preDescription } from '../hint/hint'

export default class BlockSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      result: [],
      focus: null,
    }
  }
  componentDidMount() {
    _b5Search.update(this.props.codeCanvasSource)
    document.addEventListener('mousedown', this.searchingMouseDown)
    document.addEventListener('keydown', this.handleKeydown)
    this.inputRef.focus()

    window.sessionStorage.setItem('color', method.randomColor())
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.searchingMouseDown)
    document.removeEventListener('keydown', this.handleKeydown)

    window.sessionStorage.removeItem('color')
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !equal(nextState, this.state)
  }

  searchingMouseDown = e => {
    if (!method.hoveringOnSearchBar(e.target)) {
      this.props.breakSearch()
      return
    }

    if (!method.hoveringOnSearchBlock(e.target.classList)) {
      // Not on block, move search bar
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
      document.addEventListener('mouseup', function _listener(e) {
        document.removeEventListener('mousemove', handleDragSearchBar)
        document.removeEventListener('mouseup', _listener)
      })
    } else {
      // On block
      const that = this
      document.addEventListener('mouseup', function _listener(e) {
        if (method.hoveringOnSearchBlock(e.target.classList))
          that.handleAddBlock(method.getNameFromBlockFill(e.target))
        document.removeEventListener('mouseup', _listener)
      })
    }
  }

  handleKeydown = e => {
    if (e.key === 'Enter') {
      const { result, focus } = this.state
      if (result.length !== 0) {
        this.handleAddBlock(result[focus].item.name)
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const { result, focus } = this.state
      let rL = result.length
      if (rL > 0) {
        e.preventDefault()
        if (e.key === 'ArrowLeft')
          this.setState({ focus: Math.max(focus - 1, 0) })
        else if (e.key === 'ArrowRight')
          this.setState({ focus: Math.min(focus + 1, rL - 1) })
      }
    } else if (e.key === 'Escape') {
      this.props.breakSearch()
    }
  }

  search = () => {
    const result =
      this.inputRef.value !== '' ? _b5Search.search(this.inputRef.value) : []
    this.setState({
      result: result,
      focus: result.length === 0 ? null : 0,
    })
  }

  handleAddBlock = name => {
    if (name) {
      const {
        breakSearch,
        collect,
        codeCanvasSource,
        codeCanvasIndex,
        roomY,
        roomX,
      } = this.props
      collect(
        [name, roomY.toString(), roomX.toString()],
        'addBlock',
        codeCanvasSource,
        codeCanvasIndex
      )
      breakSearch()
    }
  }

  render() {
    return (
      <div className="blockSearchHolder">
        <div ref={e => (this.blockSearch = e)} className="blockSearch">
          <input
            ref={e => (this.inputRef = e)}
            className="searchInput"
            placeholder="Search name, type, or description"
            onChange={this.search}
          />
          {this.state.result.length > 0 && (
            <BlockList blocks={this.state.result} focus={this.state.focus} />
          )}
        </div>
      </div>
    )
  }
}

const BlockList = ({ blocks, focus }) => {
  const listRef = createRef()
  const focusRef = createRef()

  useEffect(() => {
    // Scroll to the focused
    const fc = focusRef.current
    if (fc) {
      if (
        fc.offsetLeft + fc.offsetWidth >
        searchBarWidth + listRef.current.scrollLeft
      )
        // Scroll FORWARD
        listRef.current.scrollLeft =
          fc.offsetLeft + fc.offsetWidth - searchBarWidth + 34
      else if (fc.offsetLeft < listRef.current.scrollLeft)
        // Scroll BACKWARD
        listRef.current.scrollLeft = fc.offsetLeft - 34
    }
  }, [listRef, focusRef])

  return (
    <div className="blockList" ref={listRef}>
      {blocks.map((b, i) => {
        return (
          <div
            key={'blockListBlock ' + b.item.name + i}
            className="searchBlockWrapper"
          >
            <div className="wrapper">
              <BlockRendererLite
                name={b.item.name}
                source={b.item.source}
                focus={i === focus}
                isRenaming={false}
                ref={{
                  block: i === focus ? focusRef : null,
                }}
                draggable={false} // ! Should be enabled
              />
              <div className={'description' + (i === focus ? ' focused' : '')}>
                <div>{_preDescription(b.item.description)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
