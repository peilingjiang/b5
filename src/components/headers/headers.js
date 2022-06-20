import { memo, Suspense } from 'react'
import { isMacOs, isWindows } from 'react-device-detect'

import { Emoji } from '../customComponents.js'

import '../../postcss/components/headers/headers.css'

import Settings from '../../img/toolbarIcons/settings.svg'
import File from '../../img/toolbarIcons/file.svg'
import Share from '../../img/toolbarIcons/share.svg'
import NoLoop from '../../img/toolbarIcons/noloop.svg'
import Loop from '../../img/toolbarIcons/loop.svg'
import Refresh from '../../img/toolbarIcons/refresh.svg'
import Capture from '../../img/toolbarIcons/capture.svg'

const _hasMenuList = ['Settings', 'File', 'Share']
function _hasMenu(name) {
  return _hasMenuList.includes(name)
}

const menuItem = (
  keySuffix,
  classNameCustom,
  onClick = undefined,
  emoji,
  label,
  text,
  shortcutHint = undefined
) => (
  <li
    key={`icon-${keySuffix}`}
    className={classNameCustom}
    onClick={async () => {
      await onClick()
    }}
  >
    <p className={classNameCustom}>
      <Emoji emoji={emoji} label={label} />
      &nbsp;&nbsp;{text}
    </p>
    {shortcutHint && <p className="shortcutHint">{shortcutHint}</p>}
  </li>
)

const MenuMemo = ({ name, functions }) => {
  const sign = isWindows ? 'ctrl' : isMacOs ? '⌘' : 'ctrl'
  const altName = isMacOs ? 'option' : 'alt'

  const li = []
  switch (name) {
    case 'Settings':
      li.push(
        menuItem(
          'settings-comingSoon',
          'disabledText',
          null,
          '🛠️',
          'Incoming Envelope',
          'coming soon'
        )
      )
      break
    case 'File':
      li.push(
        menuItem(
          'file-save',
          '',
          functions.save,
          '💾',
          'Save',
          'save',
          `${sign} + s`
        )
      )
      li.push(
        menuItem(
          'file-startNew',
          '',
          functions.new,
          '🌱',
          'Seedling',
          'start new',
          `${sign} + ${altName} + n`
        )
      )
      li.push(
        menuItem(
          'file-randomExample',
          '',
          functions.random,
          '⭐',
          'Star',
          'random example'
          // `${sign} + ${altName} + e`
        )
      )
      break

    case 'Share':
      li.push(
        menuItem(
          'share-share-comingSoon',
          'disabledText',
          null,
          '📨',
          'Incoming Envelope',
          'coming soon'
        )
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

const imageSources = {
  Settings,
  File,
  Share,
  NoLoop,
  Loop,
  Refresh,
  Capture,
}

const IconMemo = ({ name, onClickFunc, disabled, hasDropdown, functions }) => {
  return (
    <Suspense fallback={<></>}>
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
          <img src={imageSources[name]} alt={name} />
        </div>

        {/* Dropdown */}
        {hasDropdown && <Menu name={name} functions={functions} />}
      </div>
    </Suspense>
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
