import { Publisher, PaymentCreatedEvent, Subjects } from '@solosphere/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
