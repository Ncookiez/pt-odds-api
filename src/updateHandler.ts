import { getNetworkNameByChainId } from '@generationsoftware/hyperstructure-client-js'
import { UserOdds } from './types'
import { Network } from './constants'

export const updateHandler = async (
  event: ScheduledEvent,
  chainId: Network,
  newUserOdds: UserOdds
) => {
  const networkName = getNetworkNameByChainId(chainId)

  if (!!networkName) {
    const { value: lastUserOdds, metadata } = await USER_ODDS.getWithMetadata(networkName)

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
