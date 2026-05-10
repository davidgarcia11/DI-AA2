import { subscriptionsToCsv } from '../utils/csv'

export default function ExportCsvButton({ subscriptions }) {
  function handleClick() {
    const csv = subscriptionsToCsv(subscriptions)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'subscriptions.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className="btn btn--primary" onClick={handleClick}>
      Exportar CSV
    </button>
  )
}
