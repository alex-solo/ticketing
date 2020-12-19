import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@solosphere/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new Error('Ticket not found') // msg won't be acked and NATS server will try again in x seconds
    }

    const { title, price } = data
    ticket.set({ title, price })
    await ticket.save()

    msg.ack()
  }
}
