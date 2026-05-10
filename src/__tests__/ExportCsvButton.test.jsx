import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import ExportCsvButton from '../components/ExportCsvButton'

describe('ExportCsvButton', () => {
  beforeEach(() => {
    // happy-dom no implementa createObjectURL/revokeObjectURL por defecto.
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  test('al click crea un blob con el CSV y dispara la descarga', async () => {
    const user = userEvent.setup()
    const subs = [
      {
        name: 'Netflix',
        price: 15.99,
        category: 'entretenimiento',
        billingCycle: 'monthly',
        renewalDate: '2026-06-15',
      },
    ]
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click')

    render(<ExportCsvButton subscriptions={subs} />)
    await user.click(screen.getByRole('button', { name: /exportar csv/i }))

    expect(URL.createObjectURL).toHaveBeenCalled()
    const [blob] = URL.createObjectURL.mock.calls[0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(clickSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')

    clickSpy.mockRestore()
  })
})
