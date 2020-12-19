import { Publisher, OrderCancelledEvent, Subjects } from '@solosphere/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
