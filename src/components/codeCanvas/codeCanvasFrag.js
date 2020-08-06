import React, { Component } from 'react'

import { lineHeight, roomWidth } from '../constants'

export class LineNumberRoom extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: props.style || {},
    }
    this.y = props.num // Start from 0
  }

  render() {
    return (
      <div className="lineNumberRoom">
        <p>{this.y + 1}</p>
      </div>
    )
  }
}

export class BlockRoom extends Component {
  constructor(props) {
    super(props)
    this.x = props.x // Column of the room
    this.y = props.y // Line (row) of the room
  }

  componentDidMount() {
    this.room.style.top = this.y * lineHeight + 'px'
    this.room.style.left = this.x * roomWidth + 'px'
  }

  render() {
    return <div ref={e => (this.room = e)} className="blockRoom"></div>
  }
}

export class BlockAlphabetRoom extends Component {
  constructor(props) {
    super(props)
    this.x = this._convert(props.num) // num starts from 0
  }

  _convert(num) {
    let s = '',
      t
    num++
    while (num > 0) {
      t = (num - 1) % 26
      s = String.fromCharCode(97 + t) + s // Lowercase letters
      num = ((num - t) / 26) | 0
    }
    return s
  }

  render() {
    return (
      <div className="blockAlphabetRoom">
        <p>{this.x}</p>
      </div>
    )
  }
}
