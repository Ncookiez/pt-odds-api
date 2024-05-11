import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { Network } from './constants'
import type { Data, Metadata } from './types'

export const updateHandler = async (
  event: FetchEvent | ScheduledEvent,
  chainId: Network,
  kv: KVNamespace,
  newData: Data,
  oldKv?: KVNamespace
) => {
  const networkName = getNetworkNameByChainId(chainId)

  if (!!networkName) {
    const { value: lastData, metadata } = await kv.getWithMetadata<Metadata>(networkName)

    if (!!oldKv && !!lastData) {
      event.waitUntil(oldKv.put(networkName, lastData, { metadata }))
    }

    const updateDate = new Date(Date.now()).toUTCString()

    event.waitUntil(
      kv.put(networkName, JSON.stringify(newData), { metadata: { lastUpdated: updateDate } })
    )
  }
}
