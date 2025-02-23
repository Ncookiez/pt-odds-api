import {
  PrizePool,
  divideBigInts,
  getPaginatedSubgraphDraws,
  getVaultId,
  lower,
  prizePoolABI
} from '@generationsoftware/hyperstructure-client-js'
import { PRIZE_POOLS, VIEM_CLIENT } from './constants'
import { getSubgraphVaults } from './subgraphs'
import { updateHandler } from './kvs'
import { formatUnits } from 'viem'
import type { Address } from 'viem'
import type { Data } from './types'

export const updateOdds = async (event: FetchEvent | ScheduledEvent) => {
  try {
    const newUserOdds: Data = {}

    const prizePool = new PrizePool(NETWORK, PRIZE_POOLS[NETWORK].address, VIEM_CLIENT)

    const lastDrawId = await prizePool.getLastAwardedDrawId()

    if (lastDrawId === 0) return

    const startDrawId = Math.max(0, lastDrawId - PRIZE_POOLS[NETWORK].gpDraws) + 1

    const vaults = await getSubgraphVaults()
    const vaultAddresses = vaults.map((v) => v.address)

    const vaultPortions = await prizePool.getVaultContributedPercentages(vaultAddresses, startDrawId, lastDrawId)

    const contracts: {
      address: Address
      abi: typeof prizePoolABI
      functionName: 'getVaultUserBalanceAndTotalSupplyTwab'
      args: [Address, Address, number, number]
    }[] = []

    vaults.forEach((vault) => {
      vault.userAddresses.forEach((userAddress) => {
        contracts.push({
          address: prizePool.address,
          abi: prizePoolABI,
          functionName: 'getVaultUserBalanceAndTotalSupplyTwab',
          args: [vault.address, userAddress, startDrawId, lastDrawId]
        })
      })
    })

    const multicallResults = await VIEM_CLIENT.multicall({ contracts })

    const vaultUserOdds: {
      [vaultId: string]: { userAddress: Lowercase<Address>; odds: number }[]
    } = {}

    let multicallIndex = 0
    vaults.forEach((vault) => {
      const vaultId = getVaultId({ chainId: NETWORK, address: vault.address })

      vault.userAddresses.forEach((userAddress) => {
        const call = multicallResults[multicallIndex++]

        if (call.status === 'success') {
          const [userTwab, vaultTwab] = call.result

          if (!!userTwab && !!vaultTwab) {
            if (vaultUserOdds[vaultId] === undefined) {
              vaultUserOdds[vaultId] = []
            }

            vaultUserOdds[vaultId].push({ userAddress: lower(userAddress), odds: divideBigInts(userTwab, vaultTwab, 18) })
          }
        }
      })
    })

    Object.entries(vaultUserOdds).forEach(([vaultId, entries]) => {
      const vaultPortion = vaultPortions[vaultId]

      if (!!vaultPortion) {
        entries.forEach(({ userAddress, odds }) => {
          if (newUserOdds[userAddress] === undefined) {
            newUserOdds[userAddress] = 0
          }

          newUserOdds[userAddress] += odds * vaultPortion * 100
        })
      }
    })

    await updateHandler(event, USER_ODDS, newUserOdds, OLD_USER_ODDS)

    return newUserOdds
  } catch (e) {
    console.error(e)
  }
}

export const updatePrizes = async (event: FetchEvent | ScheduledEvent) => {
  try {
    const newUserPrizes: Data = {}

    const prizePool = new PrizePool(NETWORK, PRIZE_POOLS[NETWORK].address, VIEM_CLIENT)

    const prizeToken = await prizePool.getPrizeTokenData()

    // TODO: ideally we don't need to query every draw from the subgraph - or at least ignore canary prizes
    const draws = await getPaginatedSubgraphDraws(NETWORK)

    draws.forEach((draw) => {
      draw.prizeClaims.forEach((prize) => {
        const userAddress = lower(prize.winner)

        if (newUserPrizes[userAddress] === undefined) {
          newUserPrizes[userAddress] = 0
        }

        newUserPrizes[userAddress] += parseFloat(formatUnits(prize.payout, prizeToken.decimals))
      })
    })

    await updateHandler(event, USER_PRIZES, newUserPrizes, OLD_USER_PRIZES)

    return newUserPrizes
  } catch (e) {
    console.error(e)
  }
}
