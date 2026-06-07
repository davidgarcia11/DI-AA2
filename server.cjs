const jsonServer = require('json-server')
const auth = require('json-server-auth')

const app = jsonServer.create()
const router = jsonServer.router('db.json')

app.db = router.db

const rules = auth.rewriter({
  subscriptions: 600,
})

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.sendStatus(200)
})
app.use(rules)
app.use(auth)
// json-server-auth no filtra los resultados en GET de lista (solo permite/deniega
// el acceso). Este middleware añade ?userId=X para que json-server devuelva
// únicamente las suscripciones del usuario autenticado.
app.use('/subscriptions', (req, res, next) => {
  if (req.method === 'GET' && !req.params.id && req.claims) {
    req.query.userId = String(req.claims.sub)
  }
  next()
})
app.use(jsonServer.defaults())
app.use(router)

app.listen(3001, () => {
  console.log('Backend corriendo en http://localhost:3001')
})
