import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { TicketCreatedEvent } from './ticket-created-event'
import { Subjects } from './subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // subject: Subjects.TicketCreated = Subjects.TicketCreated
  readonly subject = Subjects.TicketCreated // this is equivalent to the above line. We can tell TS with 'readonly' that this property won't change again
  queueGroupName = 'payments-service'

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data)

    msg.ack()
  }
}
