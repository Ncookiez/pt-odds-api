import { DEFAULT_HEADERS, NETWORKS } from './constants'
import { updatePrizes } from './updatePrizes'
import { fetchPrizes } from './fetchPrizes'
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

      if (url.pathname === `/${network}/prizes`) {
        const prizes = await fetchPrizes(network)

        if (!!prizes) {
          return new Response(prizes, {
            ...DEFAULT_HEADERS,
            status: 200
          })
        } else {
          return new Response(prizes, {
            ...DEFAULT_HEADERS,
            status: 500
          })
        }
      }

      if (url.pathname === `/${network}/prizes/old`) {
        const oldPrizes = await fetchPrizes(network, { old: true })

        if (!!oldPrizes) {
          return new Response(oldPrizes, {
            ...DEFAULT_HEADERS,
            status: 200
          })
        } else {
          return new Response(oldPrizes, {
            ...DEFAULT_HEADERS,
            status: 500
          })
        }
      }

      // if (url.pathname === `/${network}/update`) {
      //   await updateOdds(event, network)
      //   await updatePrizes(event, network)

      //   return new Response('Updated', {
      //     ...DEFAULT_HEADERS,
      //     status: 200
      //   })
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
