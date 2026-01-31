import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should render the app component', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React/i)).toBeDefined()
  })

  it('should render the count button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /count is/i })).toBeDefined()
  })
})
