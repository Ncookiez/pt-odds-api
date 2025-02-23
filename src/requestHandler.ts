import { updateOdds, updatePrizes } from './updaters'
import { fetchOdds, fetchPrizes } from './kvs'
import { DEFAULT_HEADERS } from './constants'

export const handleRequest = async (event: FetchEvent): Promise<Response> => {
  try {
    const { pathname, searchParams } = new URL(event.request.url)

    if (pathname.startsWith('/odds')) {
      const old = pathname.startsWith('/odds/old') || searchParams.get('old') === 'true'
      const odds = await fetchOdds({ old })

      return new Response(odds, { ...DEFAULT_HEADERS, status: !!odds ? 200 : 500 })
    }

    if (pathname.startsWith('/prizes')) {
      const old = pathname.startsWith('/prizes/old') || searchParams.get('old') === 'true'
      const prizes = await fetchPrizes({ old })

      return new Response(prizes, { ...DEFAULT_HEADERS, status: !!prizes ? 200 : 500 })
    }

    // if (pathname === `/update`) {
    //   const newOdds = await updateOdds(event)
    //   const newPrizes = await updatePrizes(event)
    //   const isSuccess = !!newOdds && !!newPrizes

    //   return new Response(isSuccess ? 'Updated' : 'Failed to update', { ...DEFAULT_HEADERS, status: isSuccess ? 200 : 500 })
    // }

    return new Response('Invalid request', { ...DEFAULT_HEADERS, status: 400 })
  } catch (e) {
    console.error(e)

    const errorResponse = new Response('Error', { ...DEFAULT_HEADERS, status: 500 })
    errorResponse.headers.set('Content-Type', 'text/plain')

    return errorResponse
  }
}
