import 'es6-promise/auto' // promise polyfill
import isomorphicFetch from 'isomorphic-fetch' // fetch polyfill

export { isomorphicFetch as fetch }
export const defaultOptions = {
  method: 'GET',
  mode: 'cors', // this don't know what it is
  credentials: 'same-origin' // this sends the cookies
}

// todo muy lindo con fetch, pero agarrar el responseText es una pijada
// response.body es un readableStream
// https://jakearchibald.com/2015/thats-so-fetch/
export function responseHandler (response) {
  if (response.status >= 400) {
    throw new Error(response.statusText)
  }
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json()
  } else {
    return response.text() // this is the preferred response on theeye
  }
}
