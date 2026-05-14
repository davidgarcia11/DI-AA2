export const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPIRED: 'EXPIRED',
}

export function getInitialState() {
  const stored = localStorage.getItem('user')
  return {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem('token'),
  }
}

export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return { user: action.payload.user, token: action.payload.token }
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.EXPIRED:
      return { user: null, token: null }
    default:
      return state
  }
}
