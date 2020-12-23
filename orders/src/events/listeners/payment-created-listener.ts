import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from '@solosphere/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  queueGroupName = queueGroupName
  readonly subject = Subjects.PaymentCreated

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket')

    if (!order) {
      throw new Error('Order not found')
    }

    order.set({
      status: OrderStatus.Complete,
    })

    await order.save()

    // when we update the order here, the version number would have increased and so usually we would publish another event to let everyone know that the order was updated. But for the purposes of this app, once an order status is "complete" it will never be updated again

    msg.ack()
  }
}
