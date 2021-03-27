import { memo } from 'react'

import FoldSVG from '../../img/icons/fold.svg'

const FoldIconMemo = ({ folded, foldFunction }) => {
  return (
    <div className="foldIcon">
      <div
        className={'fold-svg-holder ' + (folded ? 'folded' : 'unfolded')}
        onClick={foldFunction}
      >
        <img src={FoldSVG} alt="Fold Factory" title="fold" />
      </div>
    </div>
  )
}

const FoldIcon = memo(FoldIconMemo)

export default FoldIcon
