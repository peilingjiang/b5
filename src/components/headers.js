import React from 'react'

const iconsImg = {
  Settings: require('../img/toolbar-icon/settings.svg'),
  File: require('../img/toolbar-icon/file.svg'),
  Share: require('../img/toolbar-icon/share.svg'),
  NoLoop: require('../img/toolbar-icon/noLoop.svg'),
  Loop: require('../img/toolbar-icon/loop.svg'),
}

const Icon = ({ name, onClickFunc }) => {
  return (
    <div className={'toolbarIcon ' + name.toLowerCase()} onClick={onClickFunc}>
      <img src={iconsImg[name]} alt={name} />
    </div>
  )
}

export const IconList = ({ iconsName, onClickFunc }) => {
  let icons = []
  for (let i in iconsName) {
    icons.push(
      <Icon
        key={iconsName[i] + ' toolbarIcon'}
        name={iconsName[i]}
        onClickFunc={onClickFunc[i]}
      />
    )
  }
  return icons
}
