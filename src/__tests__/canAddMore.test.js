import { canAddMore, FREE_LIMIT } from '../utils/canAddMore'

test('usuario premium siempre puede añadir', () => {
  const subs = Array(10).fill({})
  expect(canAddMore(subs, 'premium')).toBe(true)
})

test('usuario free puede añadir si tiene menos de FREE_LIMIT', () => {
  const subs = Array(3).fill({})
  expect(canAddMore(subs, 'free')).toBe(true)
})

test('usuario free NO puede añadir si ha llegado al límite', () => {
  const subs = Array(FREE_LIMIT).fill({})
  expect(canAddMore(subs, 'free')).toBe(false)
})
