import { PrizePool } from '@generationsoftware/hyperstructure-client-js'
import { Network, PRIZE_POOLS, VIEM_CLIENTS } from './constants'
import { updateHandler } from './updateHandler'
import { formatUnits } from 'viem'
import { UserOdds } from './types'
import { getSubgraphVaults } from './subgraphs'

export const updateOdds = async (event: ScheduledEvent, chainId: Network) => {
  try {
    const prizePoolInfo = PRIZE_POOLS[chainId]
    const publicClient = VIEM_CLIENTS[chainId]

    if (!!prizePoolInfo && !!publicClient) {
      const prizePool = new PrizePool(chainId, prizePoolInfo.address, publicClient)

      const totalContributions = await getTotalContributions(prizePool)
      const formattedTotalContributions = parseFloat(
        formatUnits(totalContributions, prizePoolInfo.prizeToken.decimals)
      )

      const newUserOdds: UserOdds = { total: formattedTotalContributions, users: [] }

      const subgraphVaults = await getSubgraphVaults(chainId)

      // TODO: get total contributions in the last gpDraws for each vault
      // TODO: get total twab in the last gpDraws for each vault

      // TODO: get twab in the last gpDraws for each user

      // TODO: calculate user odds based on total and all vaults and add to newUserOdds.users

      return updateHandler(event, chainId, newUserOdds)
    } else {
      throw new Error('Invalid network config')
    }
  } catch (e) {
    console.error(e)
    return undefined
  }
}

const getTotalContributions = async (prizePool: PrizePool) => {
  const lastDrawId = await prizePool.getLastAwardedDrawId()

  if (lastDrawId === 0) return 0n

  const chainId = prizePool.chainId as Network
  const gpDraws = PRIZE_POOLS[chainId].gpDraws

  const startDrawId = gpDraws > lastDrawId ? 0 : lastDrawId - gpDraws + 1

  return await prizePool.getTotalContributedAmount(startDrawId, lastDrawId)
}
