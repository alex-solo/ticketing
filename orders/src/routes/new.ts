import mongoose, { version } from 'mongoose'
import express, { Request, Response } from 'express'
import {
  NotFoundError,
  requireAuth,
  validateRequest,
  BadRequestError,
  OrderStatus,
} from '@solosphere/common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

// we could also extract it to an environment variable or in a more complex app we can save to a database so an admin can change the expiration with in a UI or can also have different expiration times depending on user, etc.
const EXPIRATION_WINDOW_SECONDS = 15 * 60

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) //this will make sure that the id is in the mongoDB format. Beware though that as a result this couples this service to the tickets service in that it assumes that a mongo db is used. What if tickets service changes their database to postgres?
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body
    // find the ticket the user is trying to order in the db
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }

    // make sure that this ticket is not already reserved
    // run query to look at all orders. Find an order where the ticket is the ticket we just found **AND** the order status is not cancelled
    // If we find an order that means the ticket is reserved
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // calcualate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // build the order and save it to the db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    })
    await order.save()

    // publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), // this will give us UTC time stamp. When we share time zones across services we want to provide the timestamp in a timezone agnostic way. that usually means UTC
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    })

    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
