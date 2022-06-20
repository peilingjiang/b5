import { PureComponent, createRef, Component, forwardRef } from 'react'
import { SketchPicker } from 'react-color'

import _b5BlocksObject from '../../b5.js/src/blocks/blocksObjectWrapper.js'

export function _getParentBlockInBook(name) {
  let source = null
  for (let i in _b5BlocksObject)
    if (_b5BlocksObject[i].hasOwnProperty(name)) source = i
  if (!source) return false // TODO: Error handler
  return _b5BlocksObject[source][name]
}

class InputBoxRef extends PureComponent {
  // For both number and string input
  constructor(props) {
    super()
    this.valid = true // valid or not

    this.isNumberInput = props.thisDataType === 'number' ? true : false // true of false
    this.inputRef = props.forwardedRef || createRef()
  }

  componentDidUpdate() {
    this.inputRef.current.value = this.props.thisInlineData
  }

  _cleanValue = v => {
    if (this.isNumberInput) return isNaN(v) ? v : Number(v)
    else if (v === '')
      // For empty string input, auto replace the content
      return '^_^' // ? Are your sure?
    return v
  }

  _finished = (toBlur = true) => {
    // Handle send data
    if (this.inputRef.current) {
      // TODO: Is it possible to remove this safe?

      const { collect, x, y, thisInlineData, inlineDataInd } = this.props

      // Get the cleaned value from input
      let value = this._cleanValue(this.inputRef.current.value)

      if (this.valid && value !== thisInlineData) {
        collect([x, y, inlineDataInd, value], 'inlineDataChange')
      }

      if (toBlur) {
        this.inputRef.current.blur()

        // Remove listeners
        this.inputRef.current.removeEventListener('keypress', this._keyFinished)
      }
    }
  }

  _keyFinished = e => {
    if (e.key === 'Enter') this._finished(false) // Keep editing after pressing return...
  }

  handleFocus = e => {
    this.inputRef.current.addEventListener('keypress', this._keyFinished)
  }

  handleValueChange = () => {
    // Check if value is valid if it's a number input
    const r = this.props.range
    // If a range for the input is given, then the value must be within the range
    if (this.isNumberInput) {
      let v = this.inputRef.current.value
      let vN = Number(v)
      if (
        (isNaN(v) || (r ? vN <= r[0] || vN >= r[1] : false)) &&
        !this.inputRef.current.classList.contains('invalid')
      ) {
        this.inputRef.current.className += ' invalid'
        this.valid = false
      } else if (!isNaN(v)) {
        this.inputRef.current.className =
          this.inputRef.current.className.replace(' invalid', '')
        this.valid = true
      }
    }
  }

  handleBlur = e => {
    this._finished(true)
  }

  render() {
    const {
      action,
      className,
      thisInlineData,
      name,
      hintRefPosition,
      hintSide = 'up',
    } = this.props
    return (
      <input
        ref={this.inputRef}
        className={
          'inputBox' +
          className +
          (action ? '' : ' disabledComponent') +
          (name === 'string' ? ' stringInput' : '')
        }
        type="text"
        defaultValue={thisInlineData}
        onChange={this.handleValueChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        disabled={action ? false : true}
        data-hints={`${name} inlineData ${hintRefPosition} ${hintSide}`}
      ></input>
    )
  }
}

export const InputBox = forwardRef((props, ref) => (
  <InputBoxRef {...props} forwardedRef={ref} />
))

export class ColorPickerEntry extends Component {
  constructor() {
    super()
    this.entryRef = createRef()
    this.state = {
      picking: false,
    }
  }

  componentDidMount() {
    if (this.props.action)
      this.entryRef.current.addEventListener('click', this.handleClick, true)
  }

  componentWillUnmount() {
    if (this.props.action)
      this.entryRef.current.removeEventListener('click', this.handleClick, true)
  }

  handleClick = e => {
    this.setState({ picking: true }, function () {
      this.state.picking
        ? this.entryRef.current.parentElement.parentElement.classList.add(
            'interacting'
          )
        : this.entryRef.current.parentElement.parentElement.classList.remove(
            'interacting'
          )
    })
  }

  handleClose = e => {
    this.setState({ picking: false })
  }

  handleChange = (color, event) => {
    const { collect, x, y } = this.props
    collect(
      [
        x,
        y,
        0,
        color.hex +
          Math.floor(color.rgb.a * 255)
            .toString(16)
            .padStart(2, '0'),
      ],
      'inlineDataChange'
    )
  }

  render() {
    const { action, text, thisInlineData, scale } = this.props
    return (
      <>
        <div
          ref={this.entryRef}
          className={'pickerEntry' + (action ? '' : ' disabledComponent')}
        >
          <p className="entryText">
            <span className="pickerName">{text}</span>
            {thisInlineData.slice(0, -2)}
          </p>
        </div>
        {/* Picker */}
        {this.state.picking && (
          <div className="sketchPicker">
            <div className="pickerCover" onClick={this.handleClose} />
            <div
              style={{
                transform: `scale(${1 / scale}) translate3d(0, 0, 0)`,
                transformOrigin: '0 0',
              }}
            >
              <SketchPicker
                color={thisInlineData}
                onChange={this.handleChange}
              />
            </div>
          </div>
        )}
      </>
    )
  }
}
