import request from 'supertest'
import { app } from '../../app'

// here we use global.signin() just to avoid additional import at the top. A global function signin() is declared in setup.ts in tests
it('responds with details about the current user', async () => {
  const cookie = await global.signin()

  const response = await request(app)
    .get('/api/users/currentUser')
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual('test@test.com')
})

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentUser')
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})
