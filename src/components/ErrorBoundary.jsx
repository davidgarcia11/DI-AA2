import { Component } from 'react'

// ErrorBoundary global: captura errores de renderizado en cualquier rama del
// árbol y muestra un fallback en vez de pantalla en blanco.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // En un entorno real iría a un servicio de telemetría (Sentry, etc.).
    console.error('ErrorBoundary capturó un error:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="auth-page">
          <section
            className="card auth-card"
            role="alert"
            aria-labelledby="error-title"
          >
            <h1 id="error-title">Algo ha ido mal</h1>
            <p>
              Se ha producido un error inesperado. Puedes recargar la página o
              volver a intentarlo en unos minutos.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={this.handleRetry}
            >
              Recargar
            </button>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}
