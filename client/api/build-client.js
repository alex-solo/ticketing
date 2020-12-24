import axios from 'axios'

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server!
    // here we are reaching into a different namespace in kubernetes, domain will be different depending on where we're reaching

    return axios.create({
      baseURL: 'http://www.runningintrails.com',
      headers: req.headers,
    })
  } else {
    // we are on the browser
    // requests can be made with base URL as per usual
    // also the browser will append headers automatically. This is not the case when we're in the above scenario

    return axios.create({
      baseURL: '/',
    })
  }
}
