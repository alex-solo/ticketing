import mongoose from 'mongoose'
import { PasswordManager } from '../services/password-manager'

// An interface that describes the properties that are required to make a new User (set of properties required to build a record)
interface UserAttrs {
  email: string
  password: string
}

// An interface that describes the properties that a User doc has. After the record is saved, the document might have additional properties placed on it by mongoose. For example we can have additional fields here like createdAt
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

// An interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

// here we don't use an arrow function but "function" keyword so that "this" will refer to the user document
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await PasswordManager.toHash(this.get('password'))
    this.set('password', hashed)
  }
})

// we only made this build method to make use of TypeScript. If we use "new User(attrs)" directly, we don't get the benefit of type checking
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
