import { describe, it, expect } from 'vitest'
import { add, multiply, greet } from './utils'

describe('Utils', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
      expect(add(0, 0)).toBe(0)
    })
  })

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6)
      expect(multiply(-1, 5)).toBe(-5)
      expect(multiply(0, 10)).toBe(0)
    })
  })

  describe('greet', () => {
    it('should return a greeting message', () => {
      expect(greet('World')).toBe('Hello, World!')
      expect(greet('Alice')).toBe('Hello, Alice!')
    })
  })
})
