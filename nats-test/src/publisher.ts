import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

// can also call "stan", "client", but stan is the nats convention
// 'abc' is a client ID
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

stan.on('connect', async () => {
  console.log('publisher connected to nats')
  const publisher = new TicketCreatedPublisher(stan)

  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 30,
    })
  } catch (err) {
    console.error(err)
  }

  // // cannot send JS object so we have to convert to JSON (string)
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // })

  // // callback invoked after event (usually called "message" in world of NATS) is published. It is an optional third argument
  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published')
  // })
})
