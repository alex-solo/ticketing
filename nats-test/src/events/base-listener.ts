import { Message, Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
  subject: Subjects
  data: any
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject']
  abstract queueGroupName: string //name of queue group. we need a queue group in conjunction to the "setDurableName" method above to make sure that when a service goes down for even a split second the durable subscription does not get dumped. The queue group of course also makes sure that only one service receives an event in case we are running multiple instances of our service
  abstract onMessage(data: T['data'], msg: Message): void
  private client: Stan

  protected ackWait = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  // the default behaviour from NATS Streaming is to say that	event was received successfully as soon as it's received. We'll set manual mode to true so if something goes wrong while we are processing that message (for example saving to a database) we can say that message was not received
  // the 3 options "setDeliverAllAvailable", "setDurableName" and having queue groups mesh extremely well and give us the behaviour we want
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable() // this is required to get all the events when a service is being brought on line for the FIRST time
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName) // creates a durable subscription. when a service comes back online it will catch up with events that were missed UP TO the last successfully processed event. if we had setDeliverAllAvailable method by itself, we would get ALL events which we don't want.
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`)
      const parsedData = this.parseMessage(msg)
      this.onMessage(parsedData, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'))
  }
}
