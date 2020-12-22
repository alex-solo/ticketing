import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@solosphere/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
