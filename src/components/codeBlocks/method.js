const operationalClassNames = [
  'node',
  'tab',
  'toolbarIcon',
  'header',
  'addButton',
  'separator',
  'split',
  'sectionResizeBar',
]
export function operationalClick(target) {
  // Return true if the click is operational (dragging, clicking button...)
  let depth = 0
  while (target.parentElement !== null && depth < 2) {
    if (target.classList.length)
      for (let i in operationalClassNames)
        if (target.classList.contains(operationalClassNames[i])) return true
    target = target.parentElement
    depth++
  }
  return false
}
