import { Publisher, Subjects, TicketUpdatedEvent } from '@solosphere/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
