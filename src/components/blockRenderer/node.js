import { forwardRef, memo } from 'react'

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
  hintName,
  hintDescription,
  hintType,
  hintSide,
}) => {
  return (
    <div className={'nodeFill count' + count}>
      {/* Interaction layer */}
      <div
        className="nodeAdd node"
        ref={thisNodeRef}
        data-hint={true}
        data-hint-name={hintName}
        data-hint-description={hintDescription}
        data-hint-type={hintType}
        data-hint-category={'node'}
        data-hint-side={hintSide}
      >
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

const Node = memo(
  forwardRef((props, ref) => <NodeRef thisNodeRef={ref} {...props} />)
)

export default Node
