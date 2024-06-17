import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import type { Data, Metadata } from './types'

export const fetchOdds = async (options?: { old?: boolean }) => {
  const networkName = getNetworkNameByChainId(NETWORK)

  if (!!networkName) {
    try {
      const kv = options?.old ? OLD_USER_ODDS : USER_ODDS

      const { value: _lastUserOdds, metadata } = await kv.getWithMetadata<Metadata>(networkName)
      const lastUserOdds = !!_lastUserOdds ? (JSON.parse(_lastUserOdds) as Data) : null

      return JSON.stringify({ data: lastUserOdds, metadata })
    } catch (e) {
      return null
    }
  }
}

export const fetchPrizes = async (options?: { old?: boolean }) => {
  const networkName = getNetworkNameByChainId(NETWORK)

  if (!!networkName) {
    try {
      const kv = options?.old ? OLD_USER_PRIZES : USER_PRIZES

      const { value: _lastUserPrizes, metadata } = await kv.getWithMetadata<Metadata>(networkName)
      const lastUserPrizes = !!_lastUserPrizes ? (JSON.parse(_lastUserPrizes) as Data) : null

      return JSON.stringify({ data: lastUserPrizes, metadata })
    } catch (e) {
      return null
    }
  }
}

export const updateHandler = async (
  event: FetchEvent | ScheduledEvent,
  kv: KVNamespace,
  newData: Data,
  oldKv?: KVNamespace
) => {
  const networkName = getNetworkNameByChainId(NETWORK)

  if (!!networkName) {
    const { value: lastData, metadata } = await kv.getWithMetadata<Metadata>(networkName)

    if (!!oldKv && !!lastData) {
      event.waitUntil(oldKv.put(networkName, lastData, { metadata }))
    }

    event.waitUntil(
      kv.put(networkName, JSON.stringify(newData), {
        metadata: { lastUpdated: new Date(Date.now()).toUTCString() }
      })
    )
  }
}
