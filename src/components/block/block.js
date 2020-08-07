import React, { PureComponent } from 'react'

export default class Block extends PureComponent {
  render() {
    const { type } = this.props
    return <div className={'blockHolder ' + type + 'Section'}></div>
  }
}
