import React, { Component, createRef } from 'react'

export default class CommentBlock extends Component {
  constructor(props) {
    super()
    this.textArea = createRef()
  }

  componentDidMount() {
    this.autoGrow()
  }

  handleChange = e => {
    const { x, y, collect } = this.props
    collect([x, y, 0, this.textArea.current.value], 'inlineDataChange')
  }

  autoGrow = () => {
    this.textArea.current.style.height = 'fit-content'
    this.textArea.current.style.height =
      this.textArea.current.scrollHeight + 'px'
  }

  render() {
    const { className, inlineData } = this.props
    return (
      <div className={className}>
        <textarea
          ref={this.textArea}
          rows={1}
          className="writingArea"
          onInput={this.autoGrow}
          defaultValue={inlineData[0]}
          onBlur={this.handleChange}
        />
      </div>
    )
  }
}
