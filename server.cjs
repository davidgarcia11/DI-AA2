const jsonServer = require('json-server')
const auth = require('json-server-auth')

const app = jsonServer.create()
const router = jsonServer.router('db.json')

app.db = router.db

const rules = auth.rewriter({
  subscriptions: 660,
})

app.use(rules)
app.use(auth)
app.use(jsonServer.defaults())
app.use(router)

app.listen(3001, () => {
  console.log('Backend corriendo en http://localhost:3001')
})
