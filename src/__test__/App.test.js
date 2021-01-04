import ReactDOM from 'react-dom'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import App from '../App'

describe('App', () => {
  test('renders without crash', () => {
    render(<App />)
  })

  test('renders with Editor and Viewer components', () => {
    const root = document.createElement('div')
    ReactDOM.render(<App />, root)

    expect(root.childNodes.length).toBe(2)
    expect(root.childNodes[0]).toHaveClass('editor')
    expect(root.childNodes[1]).toHaveClass('viewer')

    ReactDOM.unmountComponentAtNode(root)
  })
})
