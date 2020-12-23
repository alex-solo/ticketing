import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from '@solosphere/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // here we don't strictly need to find an order by its version - it doesn't really matter the version since all we care about is "created" or "cancelled"
    // in another servie we extracted this to "findByEvent" method
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    })

    if (!order) {
      throw new Error('Order not found')
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()

    msg.ack()
  }
}
