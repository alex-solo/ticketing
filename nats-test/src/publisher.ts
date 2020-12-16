import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

// can also call "stan", "client", but stan is the nats convention
// 'abc' is a client ID
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

stan.on('connect', () => {
  console.log('publisher connected to nats')

  // cannot send JS object so we have to convert to JSON (string)
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20,
  })

  // callback invoked after event (usually called "message" in world of NATS) is published. It is an optional third argument
  stan.publish('ticket:created', data, () => {
    console.log('Event published')
  })
})
