import isAlphanumeric from 'validator/lib/isAlphanumeric'

import _b from '../editor/b5ObjectWrapper'

export const checkSectionNameNotValid = (name, propsName) => {
  // Return true if the name is not valid
  return (
    !isAlphanumeric(name) ||
    name.length <= 0 ||
    (name !== propsName && _b.unavailableNames.includes(name))
  )
}
