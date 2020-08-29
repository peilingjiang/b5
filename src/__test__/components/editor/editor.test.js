import React from 'react'
import { render } from '@testing-library/react'

import Editor from '../../../components/editor/editor'

describe('Editor', () => {
  test('renders without crash', () => {
    render(<Editor bridge={function () {}} />)
    // screen.debug()
  })

  test('render with expected factory labels', () => {
    const { getByText } = render(<Editor bridge={function () {}} />)

    getByText('var')
    getByText('fun')
    getByText('obj')
  })
})
