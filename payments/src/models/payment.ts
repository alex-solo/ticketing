import mongoose from 'mongoose'
import { OrderStatus } from '@solosphere/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface PaymentAttrs {
  orderId: string
  stripeId: string
}

interface PaymentDoc extends mongoose.Document {
  orderId: string
  stripeId: string
  // version: number // this isn't really needed here b/c the whole point of version is to keep track and process events in the correct order as a given record changes. Here, our records will never change - we're just creating a record once. BUUUUUT it's good practice to maybe just use version everywhere just in case we need it in the future
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
)

export { Payment }
