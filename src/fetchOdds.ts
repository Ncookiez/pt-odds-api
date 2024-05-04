import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { Network } from './constants'

export const fetchOdds = async (chainId: Network, options?: { old?: boolean }) => {
  const networkName = getNetworkNameByChainId(chainId)

  if (!!networkName) {
    try {
      const kv = options?.old ? OLD_USER_ODDS : USER_ODDS

      const { value: lastUserOdds } = await kv.getWithMetadata(networkName)

      return lastUserOdds
    } catch (e) {
      return null
    }
  }
}
