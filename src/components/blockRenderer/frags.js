import React, {
  PureComponent,
  createRef,
  forwardRef,
  memo,
  Component,
} from 'react'
import { SketchPicker } from 'react-color'

const _nodeBorderClassSelector = (
  type,
  connectType,
  focused,
  selected,
  alerted
) => {
  // type is the type of the block itself
  // connectType can be null or string type of the connected node
  // focused, selected, alerted - Boolean

  // * alerted > focused === selected > connected

  let r = ''

  if (connectType !== null) {
    // CONNECTED
    r += connectType + 'Connect connected' // All other classes are based on 'connected'
    if (alerted) r += ' alert'
    else if (focused) r += ' focused'
    else if (selected) r += ' selected'
  }
  // NOT CONNECTED
  else r += type + 'Node'

  return r
}

const NodeRef = ({
  count,
  type,
  connectType,
  thisNodeRef,
  focused,
  selected,
}) => {
  return (
    <div className={'nodeFill count' + count}>
      {/* Interaction layer */}
      <div className="nodeAdd node" ref={thisNodeRef}>
        {/* Display layer */}
        <div
          className={
            'nodeDisplay ' +
            _nodeBorderClassSelector(
              type,
              connectType,
              focused,
              selected,
              false
            )
          }
        ></div>
      </div>
    </div>
  )
}

export const Node = memo(
  forwardRef((props, ref) => <NodeRef thisNodeRef={ref} {...props} />)
)

export class InputBox extends PureComponent {
  // For both number and string input
  constructor(props) {
    super()
    this.valid = true // valid or not

    this.isNumberInput = props.thisDataType === 'number' ? true : false // true of false
    this.inputRef = createRef()
  }

  componentDidMount() {
    if (this.props.action)
      this.inputRef.current.addEventListener('click', this.handleClick, true)
  }

  componentWillUnmount() {
    if (this.props.action)
      this.inputRef.current.removeEventListener('click', this.handleClick, true)
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
        this.inputRef.current.removeEventListener(
          'keypress',
          this._keyFinished,
          true
        )
        document.removeEventListener('mousedown', this._clickFinished, true)
      }
    }
  }

  _keyFinished = e => {
    if (e.key === 'Enter') this._finished(false) // Keep editing after pressing return...
  }

  _clickFinished = e => {
    if (e.target !== this.inputRef.current) this._finished(true)
  }

  handleClick = e => {
    this.inputRef.current.addEventListener('keypress', this._keyFinished, true)
    document.addEventListener('mousedown', this._clickFinished, true)
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
        this.inputRef.current.className = this.inputRef.current.className.replace(
          ' invalid',
          ''
        )
        this.valid = true
      }
    }
  }

  render() {
    const { action, className, thisInlineData, name } = this.props
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
        disabled={action ? false : true}
      ></input>
    )
  }
}

export class ColorPickerEntry extends Component {
  constructor(props) {
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
    const { action, text, thisInlineData } = this.props
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
            <SketchPicker color={thisInlineData} onChange={this.handleChange} />
          </div>
        )}
      </>
    )
  }
}
