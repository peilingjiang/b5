import React, { Component } from 'react'

import { lineHeight, roomWidth } from './constants'

export class LineNumberRoom extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.num = props.num + 1
  }

  render() {
    return (
      <div className="lineNumberRoom">
        <p>{this.num}</p>
      </div>
    )
  }
}

export class BlockRoom extends Component {
  constructor(props) {
    super(props)
    this.x = props.x
    this.y = props.y
  }

  componentDidMount() {
    this.room.style.top = this.y * lineHeight + 'px'
    this.room.style.left = this.x * roomWidth + 'px'
  }

  render() {
    return <div ref={e => (this.room = e)} className="blockRoom"></div>
  }
}
