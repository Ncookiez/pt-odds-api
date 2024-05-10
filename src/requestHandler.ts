import { DEFAULT_HEADERS, NETWORKS } from './constants'
import { updateOdds } from './updateOdds'
import { fetchOdds } from './fetchOdds'

export const handleRequest = async (event: FetchEvent): Promise<Response> => {
  try {
    const url = new URL(event.request.url)

    for (const network of NETWORKS) {
      if (url.pathname === `/${network}`) {
        const odds = await fetchOdds(network)

        if (!!odds) {
          return new Response(odds, {
            ...DEFAULT_HEADERS,
            status: 200
          })
        } else {
          return new Response(odds, {
            ...DEFAULT_HEADERS,
            status: 500
          })
        }
      }

      if (url.pathname === `/${network}/old`) {
        const oldOdds = await fetchOdds(network, { old: true })

        if (!!oldOdds) {
          return new Response(oldOdds, {
            ...DEFAULT_HEADERS,
            status: 200
          })
        } else {
          return new Response(oldOdds, {
            ...DEFAULT_HEADERS,
            status: 500
          })
        }
      }

      // if (url.pathname === `/${network}/update`) {
      //   const newOdds = await updateOdds(event, network)

      //   if (!!newOdds) {
      //     return new Response(JSON.stringify(newOdds), {
      //       ...DEFAULT_HEADERS,
      //       status: 200
      //     })
      //   } else {
      //     return new Response(newOdds, {
      //       ...DEFAULT_HEADERS,
      //       status: 500
      //     })
      //   }
      // }
    }

    return new Response(JSON.stringify({ message: 'Invalid Request' }), {
      ...DEFAULT_HEADERS,
      status: 400
    })
  } catch (e) {
    console.error(e)

    const errorResponse = new Response('Error', {
      ...DEFAULT_HEADERS,
      status: 500
    })
    errorResponse.headers.set('Content-Type', 'text/plain')

    return errorResponse
  }
}
