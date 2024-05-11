import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { Network } from './constants'
import type { Data, Metadata } from './types'

export const fetchOdds = async (chainId: Network, options?: { old?: boolean }) => {
  const networkName = getNetworkNameByChainId(chainId)

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
