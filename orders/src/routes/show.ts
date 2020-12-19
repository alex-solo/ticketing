import express, { Request, Response } from 'express'
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@solosphere/common'
import { Order } from '../models/order'

const router = express.Router()

// can add validation step to make sure the orderId is a valid mongo db order Id
router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    res.send(order)
  }
)

export { router as showOrderRouter }
