import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@solosphere/common'
import { deleteOrderRouter } from './routes/delete'
import { indexOrderRouter } from './routes/index'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'

const app = express()
app.set('trust proxy', true) // because traffic is being proxied to our app through ingress-nginx. express will complain because it doesn't trust that https connection. We need to add this so express is aware that it's behind a proxy
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: false, // process.env.NODE_ENV !== 'test', // only over https when true. Jest sets the environment variabel NODE_ENV to "test" when we run tests
  })
)
app.use(currentUser)

app.use(deleteOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
