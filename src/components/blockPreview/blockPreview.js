import React, { PureComponent } from 'react'

import './blockPreview.css'

export default class BlockPreview extends PureComponent {
  render() {
    const { type } = this.props
    return <div className={'blockHolder ' + type + 'Section'}></div>
  }
}
