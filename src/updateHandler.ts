import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { Network } from './constants'
import type { UserOdds, UserOddsMetadata } from './types'

export const updateHandler = async (
  event: FetchEvent | ScheduledEvent,
  chainId: Network,
  newUserOdds: UserOdds
) => {
  const networkName = getNetworkNameByChainId(chainId)

  if (!!networkName) {
    const { value: lastUserOdds, metadata } = await USER_ODDS.getWithMetadata<UserOddsMetadata>(
      networkName
    )

    if (!!lastUserOdds) {
      event.waitUntil(OLD_USER_ODDS.put(networkName, lastUserOdds, { metadata }))
    }

    const updateDate = new Date(Date.now()).toUTCString()

    event.waitUntil(
      USER_ODDS.put(networkName, JSON.stringify(newUserOdds), {
        metadata: { lastUpdated: updateDate }
      })
    )
  }
}
