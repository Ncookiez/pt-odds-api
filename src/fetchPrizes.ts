import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { Network } from './constants'
import type { Data, Metadata } from './types'

export const fetchPrizes = async (chainId: Network, options?: { old?: boolean }) => {
  const networkName = getNetworkNameByChainId(chainId)

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
