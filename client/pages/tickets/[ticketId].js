import useRequest from '../../hooks/use-request'
import { useRouter } from 'next/router'

const TicketShow = ({ ticket }) => {
  const router = useRouter()
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      router.push('/orders/[orderId]', `/orders/${order.id}`),
  })

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      {/* this needs to be an arrow function because if not, by default the method will be invoked with event as an argument and in our implementation of doRequest we add any arguments to the body. This will give us an error */}
      <button onClick={() => doRequest()} className='btn btn-primary'>
        Purchase
      </button>
    </div>
  )
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query

  const { data } = await client.get(`/api/tickets/${ticketId}`)

  return { ticket: data }
}

export default TicketShow
