import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createSubscription,
  getSubscription,
  updateSubscription,
} from '../services/subscriptions.service'

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'entretenimiento',
  billingCycle: 'monthly',
  renewalDate: '',
  domain: '',
}

const CATEGORIES = ['entretenimiento', 'musica', 'trabajo', 'otro']

export default function SubscriptionFormPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getSubscription(token, id).then((sub) => {
      setForm({
        name: sub.name,
        price: sub.price,
        category: sub.category,
        billingCycle: sub.billingCycle,
        renewalDate: sub.renewalDate,
        domain: sub.domain ?? '',
      })
    })
  }, [isEdit, token, id])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      billingCycle: form.billingCycle,
      renewalDate: form.renewalDate,
      domain: form.domain,
    }
    try {
      if (isEdit) {
        await updateSubscription(token, id, payload)
      } else {
        await createSubscription(token, payload)
      }
      navigate('/dashboard')
    } catch {
      setError('No se pudo guardar la suscripción. Inténtalo de nuevo.')
    }
  }

  return (
    <>
      <h1>{isEdit ? 'Editar suscripción' : 'Nueva suscripción'}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nombre
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Precio (€)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Categoría
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ciclo de facturación
          <select
            name="billingCycle"
            value={form.billingCycle}
            onChange={handleChange}
          >
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </label>

        <label>
          Próxima renovación
          <input
            name="renewalDate"
            type="date"
            value={form.renewalDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Dominio (opcional)
          <input
            name="domain"
            type="text"
            value={form.domain}
            onChange={handleChange}
            placeholder="netflix.com"
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit">Guardar</button>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Cancelar
        </button>
      </form>
    </>
  )
}
