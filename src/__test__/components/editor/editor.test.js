import React from 'react'
import { render } from '@testing-library/react'

import Editor from '../../../components/editor/editor'
import defaultValue from '../../../components/editor/defaultValue'

describe('Editor', () => {
  test('renders without crash', () => {
    render(<Editor bridge={function() {}} />)
    // screen.debug()
  })

  test('renders with correct data', () => {
    let data = null
    const testBridge = d => {
      data = d
    }
    render(<Editor bridge={testBridge} />)
    expect(data).toBe(defaultValue)
  })

  test('render with expected factory labels', () => {
    const { getByText } = render(<Editor bridge={function() {}} />)

    getByText('variable')
    getByText('function')
    getByText('object')
  })
})
