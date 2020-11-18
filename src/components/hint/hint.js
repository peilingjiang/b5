import React, { PureComponent, createRef } from 'react'
import ReactDOM from 'react-dom'

import { colorPalette } from '../constants'
import '../../postcss/components/hint/hint.css'

export const _preDescription = d => {
  return d.charAt(d.length - 1) === '.' ? d.slice(0, -1) : d
}

const HintBlock = (
  hintName,
  hintDescription,
  hintType,
  hintCategory,
  hintSide,
  top,
  left
) => {
  const style =
    hintCategory === 'block'
      ? {
          backgroundColor: colorPalette[hintType],
        }
      : {
          backgroundColor: 'transparent',
          color: colorPalette[hintType],
          border: '1px solid ' + colorPalette[hintType],
        }
  return (
    <div
      id="hint"
      className={'hint ' + hintSide}
      style={{
        top: top,
        left: left,
      }}
    >
      <div className="hint-info">
        {hintName && hintDescription ? (
          <>
            <p className={'hint-name ' + hintType} style={style}>
              {hintName}
            </p>
            <p className="hint-description">
              {_preDescription(hintDescription)}
            </p>
          </>
        ) : (
          <p className="hint-no-available">no description available : (</p>
        )}
      </div>

      <div className="hint-category">{hintCategory}</div>
    </div>
  )
}

export default class Hint extends PureComponent {
  constructor() {
    super()
    this.hintHolder = createRef()
    this.hint = false
    this.moveTimeout = null

    this.target = null // This target
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleHintEvent)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleHintEvent)
  }

  addHint = e => {
    const data = e.target.dataset

    if (data.hint) {
      const rect = e.target.getBoundingClientRect()
      const hintSide = data.hintSide || 'up'

      const top =
        hintSide === 'up'
          ? rect.top
          : hintSide === 'down'
          ? rect.top + rect.height
          : rect.top + 0.5 * rect.height
      const left =
        hintSide === 'left'
          ? rect.left
          : hintSide === 'right'
          ? rect.left + rect.width
          : rect.left + rect.width * 0.5

      const newElement = HintBlock(
        data.hintName,
        data.hintDescription,
        data.hintType,
        data.hintCategory,
        hintSide,
        top,
        left
      )

      try {
        ReactDOM.render(newElement, this.hintHolder.current)
        this.hint = true
        this.target = e.target
      } catch (e) {
        console.error(e)
      }
    }
  }

  clearHint = () => {
    if (this.hint) {
      ReactDOM.unmountComponentAtNode(this.hintHolder.current)
      this.hint = false
      this.target = null
    }
  }

  handleHintEvent = e => {
    if (e.target !== this.target || e.which !== 0) {
      clearInterval(this.moveTimeout)
      this.clearHint()

      const that = this
      this.moveTimeout = setTimeout(function () {
        that.addHint(e)
      }, 350)
    }
  }

  render() {
    return <div id="hintHolder" ref={this.hintHolder}></div>
  }
}
