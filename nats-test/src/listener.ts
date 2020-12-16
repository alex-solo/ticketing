import nats, { Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

stan.on('connect', () => {
  console.log('listener connected to NATS')

  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })

  // the default behaviour from NATS Streaming is to say that	event was received successfully as soon as it's received. We'll set manual mode to true so if something goes wrong while we are processing that message (for example saving to a database) we can say that message was not received
  const options = stan.subscriptionOptions().setManualAckMode(true)
  const subscription = stan.subscribe(
    'ticket:created',
    'ordersServiceQueueGroup', //name of queue group
    options
  )

  subscription.on('message', (msg: Message) => {
    const data = msg.getData()

    if (typeof data === 'string') {
      console.log(`Received event # ${msg.getSequence()}, with data: ${data}`)
    }

    msg.ack()
  })
})

// these two will listen to Signal interrupt and terminate signals. When ts-node-dev restarts our program or when we hit ctrl-C
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
