import { searchBarWidth, searchBarHeight } from '../constants'

export const hoveringOnSearchBar = target => {
  let depth = 0
  while (!target.classList.contains('blockSearch') && depth < 6) {
    if (target.parentElement === null) return false
    target = target.parentElement
    depth++
  }
  return target.classList.contains('blockSearch') ? true : false
}

export const dragSearchBar = (props, e) => {
  e.preventDefault()
  const { mouse, blockSearch } = props
  let delta = {
    x: e.clientX - mouse.x,
    y: e.clientY - mouse.y,
  }

  blockSearch.style.left =
    Math.min(
      Math.max(mouse.left + delta.x, 0),
      window.innerWidth - searchBarWidth
    ) + 'px'
  blockSearch.style.top =
    Math.min(
      Math.max(mouse.top + delta.y, 0),
      window.innerHeight - searchBarHeight
    ) + 'px'
}