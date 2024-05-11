import {
  PrizePool,
  getPaginatedSubgraphDraws,
  lower
} from '@generationsoftware/hyperstructure-client-js'
import { Network, PRIZE_POOLS, VIEM_CLIENTS } from './constants'
import { updateHandler } from './updateHandler'
import type { Data } from './types'
import { formatUnits } from 'viem'

export const updatePrizes = async (event: FetchEvent | ScheduledEvent, chainId: Network) => {
  try {
    const prizePoolInfo = PRIZE_POOLS[chainId]
    const publicClient = VIEM_CLIENTS[chainId]

    if (!!prizePoolInfo && !!publicClient) {
      const prizePool = new PrizePool(chainId, prizePoolInfo.address, publicClient)

      const prizeToken = await prizePool.getPrizeTokenData()

      const draws = await getPaginatedSubgraphDraws(chainId)

      const newUserPrizes: Data = {}

      draws.forEach((draw) => {
        draw.prizeClaims.forEach((prize) => {
          const userAddress = lower(prize.winner)

          if (newUserPrizes[userAddress] === undefined) {
            newUserPrizes[userAddress] = 0
          }

          newUserPrizes[userAddress] += parseFloat(formatUnits(prize.payout, prizeToken.decimals))
        })
      })

      await updateHandler(event, chainId, USER_PRIZES, newUserPrizes, OLD_USER_PRIZES)

      return newUserPrizes
    } else {
      throw new Error('Invalid network config')
    }
  } catch (e) {
    console.error(e)
  }
}
