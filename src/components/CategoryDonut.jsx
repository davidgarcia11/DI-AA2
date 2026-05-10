import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { computeByCategory } from '../utils/stats'

// Chart.js v4 requiere registrar los elementos que se vayan a usar.
ChartJS.register(ArcElement, Tooltip, Legend)

const PALETTE = [
  '#4f46e5',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#a855f7',
]

export default function CategoryDonut({ subscriptions }) {
  const byCategory = computeByCategory(subscriptions)
  const labels = Object.keys(byCategory)

  if (labels.length === 0) {
    return <p>Sin datos para el gráfico todavía.</p>
  }

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((cat) => byCategory[cat]),
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
      },
    ],
  }

  return <Doughnut data={data} />
}
