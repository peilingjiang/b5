import { PureComponent, createRef } from 'react'
import ReactDOM from 'react-dom'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper'

import { colorPalette, hintWait } from '../constants'
import '../../postcss/components/hint/hint.css'

export const _preDescription = d => {
  return d.charAt(d.length - 1) === '.' ? d.slice(0, -1) : d
}

const dict_cat_to_display_cat = {
  inputNodes: 'node',
  outputNodes: 'node',
  inlineData: 'input',
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
    if (e.target.dataset.hints) {
      const [
        blockName,
        category,
        position,
        side,
      ] = e.target.dataset.hints.split(' ')

      /**
       *
       * ['blockName', 'category', '[position]', 'hintSide']
       *
       */

      const rect = e.target.getBoundingClientRect()
      const hintSide = side || 'up'
      const b = _b5BlocksObject.getBlock(blockName)

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

      let name, description, type, categoryDisplay
      switch (category) {
        case 'block':
          name = blockName
          description = b.description
          type = b.type
          categoryDisplay = category
          break

        default:
          const component = b[category][position]
          name = component.name
          description = component.description
          type = component.type[0] // !
          categoryDisplay = dict_cat_to_display_cat[category]
          break
      }

      const newElement = HintBlock(
        name,
        description,
        type,
        categoryDisplay,
        hintSide,
        top,
        left
      )

      try {
        ReactDOM.render(newElement, this.hintHolder.current)
        this.hint = true
        this.target = e.target
      } catch (error) {}
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
      }, hintWait)
    }
  }

  render() {
    return <div id="hintHolder" ref={this.hintHolder}></div>
  }
}
