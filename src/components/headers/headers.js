import React, { memo } from 'react'

import '../../postcss/components/headers/headers.css'

const IconMemo = ({ name, onClickFunc, disabled }) => {
  return (
    <div
      className={
        'toolbarIcon ' +
        name.toLowerCase() +
        (disabled ? ' toolbarIconDisabled' : '')
      }
      onClick={disabled ? null : onClickFunc}
    >
      <img
        src={require(`../../img/toolbar-icon/${name.toLowerCase()}.svg`)}
        alt={name}
      />
    </div>
  )
}

const Icon = memo(IconMemo)

export const IconList = ({ iconsName, iconsOnClickFunc, iconsDisabled }) => {
  let icons = []
  for (let i in iconsName) {
    icons.push(
      <Icon
        key={iconsName[i] + ' toolbarIcon'}
        name={iconsName[i]}
        onClickFunc={iconsOnClickFunc[i]}
        disabled={iconsDisabled[i]}
      />
    )
  }
  return icons
}
