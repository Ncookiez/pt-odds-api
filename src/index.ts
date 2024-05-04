import { handleScheduled } from './scheduledHandler'
import { handleRequest } from './requestHandler'

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event))
})

addEventListener('scheduled', (event) => {
  event.waitUntil(handleScheduled(event))
})
