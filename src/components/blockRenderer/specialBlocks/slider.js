import { Component, createRef } from 'react'
import equal from 'react-fast-compare'

import Node from '../node.js'
import { InputBox } from '../frags.js'
import { getOutputConnectType } from '../blockRendererMethod.js'

import ThumbArrow from '../../../img/components/arrow.svg'

function constrain(v, a, b) {
  // Constrain v within a and b without
  // knowing the relationship between a and b
  // (which is larger and which is smaller)
  const min = Math.min,
    max = Math.max
  return max(min(v, max(a, b)), min(a, b))
}

const countDecimalPlaces = n => {
  if (Math.floor(n.valueOf()) === n.valueOf()) return 0
  return n.toString().split('.')[1].length || 0
}

const _inputRangeThumbWidth = 0 // Actual width is 2px
const _stepRange = [0, Infinity]

const _getLength = (totalLen, current, min, max) => {
  return current === min
    ? 0
    : current === max
    ? totalLen
    : totalLen * ((current - min) / (max - min))
}

const _getValue = (totalLen, length, min, max, step) => {
  // Get value from slider length
  return length === 0
    ? min
    : length === totalLen
    ? max
    : Math.max(
        Math.min(
          Math.round(((length / totalLen) * (max - min) + min) / step) * step,
          max
        ),
        min
      )
}

class InputRange extends Component {
  constructor(props) {
    super(props)
    this.state = { currentValue: props.inlineData[0] }

    this.textBoxPosition = 'r'
    this.currentInput = createRef()
  }

  componentDidMount() {
    this.totalLength = this.sliderBox.offsetWidth - _inputRangeThumbWidth
    this._setPosition()
    this._placeTextBox()
  }

  componentDidUpdate() {
    this._setPosition()
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

    let l = _getLength(this.totalLength, newCurrent, min, max)
    this.rangeBelow.style.width = l + 1 + 'px'
    this.thumb.style.left = l - 5 + 'px'
  }

  collectRangeData() {
    // Collect current data to editor
    const { collect, x, y } = this.props
    collect([x, y, 0, this.state.currentValue], 'inlineDataChange')
  }

  _placeTextBox = () => {
    if (this.rangeBelow.offsetWidth > this.totalLength * 0.69) {
      if (this.textBoxPosition === 'r') {
        this.textBoxPosition = 'l'
        this.currentInput.current.style.left = 'unset'
        this.currentInput.current.style.right = '15px' // calc($thumb-width + $gap)
      }
    } else {
      if (this.textBoxPosition === 'l') {
        this.textBoxPosition = 'r'
        this.currentInput.current.style.left = '15px'
        this.currentInput.current.style.right = 'unset'
      }
    }

    // Arrows
    if (this.rangeBelow.offsetWidth > this.totalLength - 8) {
      this.rArrow.style.display = 'none'
    } else if (this.rangeBelow.offsetWidth < 8) {
      this.lArrow.style.display = 'none'
    } else if (
      this.lArrow.style.display !== 'block' ||
      this.rArrow.style.display !== 'block'
    ) {
      this.lArrow.style.display = this.rArrow.style.display = 'block'
    }
  }

  handleSlide = e => {
    e.stopPropagation()
    if (!e.target.classList.contains('inputBox')) {
      // Not clicking on the input box
      const that = this
      const iD = this.props.inlineData
      let mouse = {
        x: e.clientX,
        width: this.rangeBelow.offsetWidth,
      }

      const handleDrag = e => {
        let deltaX = (e.clientX - mouse.x) / this.props.scale

        let value = _getValue(
          this.totalLength,
          Math.max(Math.min(deltaX + mouse.width, this.totalLength), 0),
          iD[1],
          iD[2],
          iD[3]
        )
        if (value !== this.state.currentValue)
          this.setState({ currentValue: value })

        this.rangeBelow.style.width =
          _getLength(this.totalLength, value, iD[1], iD[2]) + 'px'

        // Move current text box to the left or right if needed
        this._placeTextBox()

        this.collectRangeData()
      }

      this.sliderBox.classList.replace('defaultCursor', 'ewResizing')
      this.sliderBox.parentElement.classList.replace('grab', 'ewResizing')

      document.addEventListener('mousemove', handleDrag, true)
      document.addEventListener(
        'mouseup',
        function _listener() {
          that.sliderBox.classList.replace('ewResizing', 'defaultCursor')
          that.sliderBox.parentElement.classList.replace('ewResizing', 'grab')
          document.removeEventListener('mousemove', handleDrag, true)
          document.removeEventListener('mouseup', _listener, true)
        },
        true
      )
    }
  }

  render() {
    const { action, name, x, y, inlineData, collect, fraction } = this.props
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
        {/* Thumb */}
        <div
          ref={e => (this.thumb = e)}
          onMouseDown={action ? this.handleSlide : null}
          className="thumb sliderComponent ewResizing"
        >
          <img
            ref={e => (this.lArrow = e)}
            src={ThumbArrow}
            className="thumbArrowLeft thumbArrow"
            alt=""
          />
          <img
            ref={e => (this.rArrow = e)}
            src={ThumbArrow}
            className="thumbArrowRight thumbArrow"
            alt=""
          />
          {/* CURRENT */}
          <InputBox
            ref={this.currentInput}
            action={action}
            className={' current'}
            thisInlineData={currentValue.toFixed(
              countDecimalPlaces(inlineData[3])
            )}
            thisDataType={'number'}
            inlineDataInd={0}
            name={name}
            x={x}
            y={y}
            collect={collect}
            hintRefPosition={0}
          />
        </div>

        <div ref={e => (this.sliderInput = e)} className="sliderInput">
          {/* MIN */}
          {!fraction && (
            <InputBox
              action={action}
              className={' sliderSet min'}
              thisInlineData={inlineData[1]}
              thisDataType={'number'}
              inlineDataInd={1}
              name={name}
              x={x}
              y={y}
              collect={collect}
              hintRefPosition={1}
              hintSide={'down'}
            />
          )}

          <p className="nodeText bottomText stepText">step</p>
          {/* STEP */}
          <InputBox
            action={action}
            className={' sliderSet step'}
            thisInlineData={inlineData[3]}
            thisDataType={'number'}
            inlineDataInd={3}
            range={_stepRange}
            name={name}
            x={x}
            y={y}
            collect={collect}
            hintRefPosition={3}
            hintSide={'down'}
          />

          {/* MAX */}
          {!fraction && (
            <InputBox
              action={action}
              className={' sliderSet max'}
              thisInlineData={inlineData[2]}
              thisDataType={'number'}
              inlineDataInd={2}
              name={name}
              x={x}
              y={y}
              collect={collect}
              hintRefPosition={2}
              hintSide={'down'}
            />
          )}
        </div>
      </div>
    )
  }
}

class Slider extends Component {
  constructor(props) {
    super(props)
    this.sliderRef = createRef()
  }
}

export default class SliderBlock extends Slider {
  /*
  
  <SliderBlock>
    <InputRange>
      <InputBox />
    </InputRange>
  </SliderBlock>

  */
  render() {
    const {
      action,
      className,
      name,
      text,
      type,
      x,
      y,
      inlineData,
      input,
      inputNodes,
      output,
      outputNodes,
      collect,
      nodesRef,
      focused,
      selectedNodes,
      scale,
      fraction,
    } = this.props

    return (
      <div className={className} data-hints={`${name} block`}>
        {fraction && (
          <div className="nodes inputNodes">
            <Node
              nodeClass="input"
              count={1}
              type={type}
              connectType={input[0] !== null ? inputNodes[0].type[0] : null}
              ref={nodesRef.input[0]}
              focused={focused}
              selected={selectedNodes.input.includes('0')}
              name={name}
              nodeType={'inputNodes'}
              hintRefPosition={0}
              hintSide={'up'}
              background={true}
            />
          </div>
        )}

        <InputRange
          action={action}
          name={name}
          inlineData={inlineData}
          collect={collect}
          x={x}
          y={y}
          scale={scale}
          fraction={fraction}
        />

        <p
          className={'nodeText bottomText' + (fraction ? ' fractionText' : '')}
        >
          {text}
        </p>
        <div className="nodes outputNodes">
          <Node
            nodeClass="output"
            count={1}
            type={type}
            connectType={getOutputConnectType(output, outputNodes, 0)}
            ref={nodesRef.output[0]}
            focused={focused}
            selected={selectedNodes.output.includes('0')}
            name={name}
            nodeType={'outputNodes'}
            hintRefPosition={0}
            hintSide={'down'}
          />
        </div>
      </div>
    )
  }
}
