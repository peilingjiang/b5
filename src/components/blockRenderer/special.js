import React, { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import { Node, InputBox } from './frags'

function constrain(v, a, b) {
  // Constrain v within a and b without
  // knowing the relationship between a and b
  // (which is larger and which is smaller)
  const min = Math.min,
    max = Math.max
  return max(min(v, max(a, b)), min(a, b))
}

export class InputBlock extends Component {
  constructor(props) {
    super(props)
    this.inputBox = createRef()
  }

  render() {
    const {
      action,
      className,
      name,
      type,
      x,
      y,
      inlineData,
      output,
      outputNodes,
      collect,
      nodesRef,
      focused,
      selectedNodes,
    } = this.props
    return (
      <div className={className}>
        <div className="left">
          <div className="blockName">{name}</div>
          <div className="nodes outputNodes">
            <Node
              nodeClass="output"
              count={1}
              type={type}
              connectType={
                output[0].length !== 0 ? outputNodes[0].type[0] : null
              }
              ref={nodesRef.output[0]}
              focused={focused}
              selected={selectedNodes.output.includes('0')}
            />
          </div>
        </div>
        <div className="right">
          <InputBox
            action={action}
            className={''}
            thisInlineData={inlineData[0]}
            inlineDataInd={0}
            name={name}
            x={x}
            y={y}
            collect={collect}
          />
        </div>
      </div>
    )
  }
}

const _inputRangeThumbWidth = 1

class InputRange extends Component {
  constructor(props) {
    super(props)
    this.state = { currentValue: props.inlineData[0] }
  }

  componentDidMount() {
    this.totalLength =
      this.sliderBox.getBoundingClientRect().width - _inputRangeThumbWidth
    this._setPosition()

    if (this.props.action)
      this.thumb.addEventListener('mousedown', this.handleSlide, true)
  }

  componentDidUpdate() {
    this._setPosition()
  }

  componentWillUnmount() {
    if (this.props.action)
      this.thumb.removeEventListener('mousedown', this.handleSlide, true)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !equal(nextProps, this.props) ||
      nextState.currentValue !== this.state.currentValue
    )
  }

  _setPosition = () => {
    const {
      x,
      y,
      collect,
      inlineData: [current, min, max],
    } = this.props
    // Make sure the current value is in the range
    let newCurrent = current
    if (current !== constrain(current, min, max)) {
      newCurrent = constrain(current, min, max)
      collect([x, y, 0, newCurrent], 'inlineDataChange')
      this.setState({ currentValue: newCurrent })
    }
    this.rangeBelow.style.width = this._getLength(newCurrent, min, max) + 'px'
  }

  _getLength = (current, min, max) => {
    // Get length from current slider value
    return (this.totalLength * (current - min)) / (max - min)
  }

  _getValue = (length, min, max, step) => {
    // Get value from slider length
    return length === 0
      ? min
      : length === this.totalLength
      ? max
      : Math.max(
          Math.min(
            Math.round(
              ((length / this.totalLength) * (max - min) + min) / step
            ) * step,
            max
          ),
          min
        )
  }

  collectRangeData() {
    // Collect current data to editor
    const { collect, x, y } = this.props
    collect([x, y, 0, this.state.currentValue], 'inlineDataChange')
  }

  handleSlide = e => {
    if (!e.target.classList.contains('inputBox')) {
      const that = this
      const iD = this.props.inlineData
      let mouse = {
        x: e.clientX,
        width: this.rangeBelow.offsetWidth,
      }

      const handleDrag = e => {
        let deltaX = (e.clientX - mouse.x) / this.props.scale

        let value = this._getValue(
          Math.max(Math.min(deltaX + mouse.width, this.totalLength), 0),
          iD[1],
          iD[2],
          iD[3]
        )
        if (value !== this.state.currentValue)
          this.setState({ currentValue: value })

        this.rangeBelow.style.width =
          this._getLength(value, iD[1], iD[2]) + 'px'
        this.collectRangeData()
      }

      this.sliderBox.classList.replace('defaultCursor', 'ewResizing')
      this.rangeBelow.classList.add('ewResizing')

      document.addEventListener('mousemove', handleDrag, true)
      document.addEventListener(
        'mouseup',
        function _listener() {
          that.sliderBox.classList.replace('ewResizing', 'defaultCursor')
          that.rangeBelow.classList.remove('ewResizing')
          document.removeEventListener('mousemove', handleDrag, true)
          document.removeEventListener('mouseup', _listener, true)
        },
        true
      )
    }
  }

  render() {
    const { action, name, x, y, inlineData, collect } = this.props
    const { currentValue } = this.state

    return (
      <div
        ref={e => (this.sliderBox = e)}
        className={
          'sliderBox sliderComponent defaultCursor' +
          (action ? '' : ' disabledComponent')
        }
      >
        <div
          ref={e => (this.rangeBelow = e)}
          className="rangeBelow sliderComponent"
        ></div>
        <div
          ref={e => (this.thumb = e)}
          className="thumb sliderComponent ewResizing"
        >
          <InputBox
            action={action}
            className={'current'}
            thisInlineData={currentValue}
            inlineDataInd={0}
            name={name}
            x={x}
            y={y}
            collect={collect}
          />
        </div>

        <div ref={e => (this.sliderInput = e)} className="sliderInput">
          <InputBox
            action={action}
            className={'sliderSet min'}
            thisInlineData={inlineData[1]}
            inlineDataInd={1}
            name={name}
            x={x}
            y={y}
            collect={collect}
          />

          <InputBox
            action={action}
            className={'sliderSet step'}
            thisInlineData={inlineData[3]}
            inlineDataInd={3}
            range={[0, Infinity]}
            name={name}
            x={x}
            y={y}
            collect={collect}
          />

          <InputBox
            action={action}
            className={'sliderSet max'}
            thisInlineData={inlineData[2]}
            inlineDataInd={2}
            name={name}
            x={x}
            y={y}
            collect={collect}
          />
        </div>
      </div>
    )
  }
}

export class SliderBlock extends Component {
  /*
  
  <SliderBlock>
    <InputRange>
      <InputBox />
    </InputRange>
  </SliderBlock>

  */
  constructor(props) {
    super(props)
    this.sliderRef = createRef()
  }

  render() {
    const {
      action,
      className,
      name,
      type,
      x,
      y,
      inlineData,
      output,
      outputNodes,
      collect,
      nodesRef,
      focused,
      selectedNodes,
      scale,
    } = this.props

    return (
      <div className={className}>
        <div className="left">
          <div className="blockName">{name.replace('Slider', '')}</div>
          <div className="nodes outputNodes">
            <Node
              nodeClass="output"
              count={1}
              type={type}
              connectType={
                output[0].length !== 0 ? outputNodes[0].type[0] : null
              }
              ref={nodesRef.output[0]}
              focused={focused}
              selected={selectedNodes.output.includes('0')}
            />
          </div>
        </div>

        <div className="right">
          <InputRange
            action={action}
            name={name}
            inlineData={inlineData}
            collect={collect}
            x={x}
            y={y}
            scale={scale}
          />
        </div>
      </div>
    )
  }
}
