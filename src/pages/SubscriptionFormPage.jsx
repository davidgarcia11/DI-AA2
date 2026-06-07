import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getLogoUrl } from '../utils/logo'
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
  const { token, user } = useAuth()
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
      userId: user.id,
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
    <div className="form-page">
      <h1>{isEdit ? 'Editar suscripción' : 'Nueva suscripción'}</h1>

      <form className="card" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field field--full">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="price">Precio (€)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="billingCycle">Ciclo de facturación</label>
            <select
              id="billingCycle"
              name="billingCycle"
              value={form.billingCycle}
              onChange={handleChange}
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="renewalDate">Próxima renovación</label>
            <input
              id="renewalDate"
              name="renewalDate"
              type="date"
              value={form.renewalDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field field--full">
            <label htmlFor="domain">Dominio (opcional)</label>
            <input
              id="domain"
              name="domain"
              type="text"
              value={form.domain}
              onChange={handleChange}
              placeholder="netflix.com"
            />
          </div>

          {(form.domain || form.name) && (
            <div className="field field--full">
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Vista previa del logo
              </p>
              <img
                src={getLogoUrl(form.name, form.domain)}
                alt="Vista previa del logo"
                width="48"
                height="48"
                style={{ borderRadius: '8px' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="alert alert--error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
