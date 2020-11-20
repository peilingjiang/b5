import React, { memo } from 'react'
import { isMacOs, isWindows } from 'react-device-detect'

import { Emoji } from '../customComponents'

import '../../postcss/components/headers/headers.css'

const _hasMenuList = ['File', 'Share']
function _hasMenu(name) {
  return _hasMenuList.includes(name)
}

const MenuMemo = ({ name, functions }) => {
  const sign = isWindows ? 'ctrl' : isMacOs ? '⌘' : 'ctrl'
  const altName = isMacOs ? 'option' : 'alt'

  const li = []
  switch (name) {
    case 'File':
      li.push(
        <li key="icon-file-save" onClick={functions.save}>
          <p>
            <Emoji emoji="💾" label="Floppy Disk" /> save
          </p>
          <p className="shortcutHint">{sign + ' + s'}</p>
        </li>
      )
      li.push(
        <li key="icon-file-startNew" onClick={functions.new}>
          <p>
            <Emoji emoji="🌱" label="Seedling" /> start new
          </p>
          <p className="shortcutHint">{sign + ' + ' + altName + ' + n'}</p>
        </li>
      )
      li.push(
        <li key="icon-file-randomExample" onClick={functions.random}>
          <p>
            <Emoji emoji="🎲" label="Random" /> random example
          </p>
          {/* <p className="shortcutHint">{sign + ' + ' + altName + ' + n'}</p> */}
        </li>
      )
      break

    case 'Share':
      li.push(
        <li key="icon-share-comingSoon" className="disabledText">
          <p className="disabledText">
            <Emoji emoji="📨" label="Incoming Envelope" /> coming soon
          </p>
        </li>
      )
      break

    default:
      break
  }

  return (
    <div className="iconMenuHolder">
      <ul className="iconMenu">{li}</ul>
    </div>
  )
}

const Menu = memo(MenuMemo)

const IconMemo = ({ name, onClickFunc, disabled, hasDropdown, functions }) => {
  return (
    <div
      className={
        (hasDropdown ? 'hasDropdown ' : '') +
        'toolbarIcon ' +
        name.toLowerCase() +
        (disabled ? ' toolbarIconDisabled' : '')
      }
      onClick={disabled ? null : onClickFunc}
    >
      <div
        className="toolbarIconBg"
        title={iconTitleMapping[name] || name.toLowerCase()}
      >
        <img
          src={
            require(`../../img/toolbar-icon/${name.toLowerCase()}.svg`).default
          }
          alt={name}
        />
      </div>

      {/* Dropdown */}
      {hasDropdown && <Menu name={name} functions={functions} />}
    </div>
  )
}

const iconTitleMapping = {
  NoLoop: 'stop',
  Loop: 'start',
}

const Icon = memo(IconMemo)

export const IconList = ({
  iconsName,
  iconsOnClickFunc,
  iconsDisabled,
  functions,
}) => {
  let icons = []
  for (let i in iconsName) {
    icons.push(
      <Icon
        key={iconsName[i] + ' toolbarIcon'}
        name={iconsName[i]}
        onClickFunc={iconsOnClickFunc[i]}
        disabled={iconsDisabled[i]}
        hasDropdown={_hasMenu(iconsName[i])}
        functions={functions}
      />
    )
  }
  return icons
}
