import {
  PrizePool,
  divideBigInts,
  getSimpleMulticallResults,
  getVaultId,
  lower,
  prizePoolABI
} from '@generationsoftware/hyperstructure-client-js'
import { Network, PRIZE_POOLS, VIEM_CLIENTS } from './constants'
import { getSubgraphVaults } from './subgraphs'
import { updateHandler } from './updateHandler'
import { UserOdds } from './types'
import type { Address } from 'viem'

export const updateOdds = async (event: ScheduledEvent, chainId: Network) => {
  try {
    const prizePoolInfo = PRIZE_POOLS[chainId]
    const publicClient = VIEM_CLIENTS[chainId]

    if (!!prizePoolInfo && !!publicClient) {
      const prizePool = new PrizePool(chainId, prizePoolInfo.address, publicClient)

      const lastDrawId = await prizePool.getLastAwardedDrawId()

      if (lastDrawId === 0) return

      const gpDraws = PRIZE_POOLS[chainId].gpDraws
      const startDrawId = Math.max(0, lastDrawId - gpDraws) + 1

      const vaults = await getSubgraphVaults(chainId)
      const vaultAddresses = vaults.map((v) => v.address)

      const newUserOdds: UserOdds = {}

      const vaultPortions = await prizePool.getVaultContributedPercentages(
        vaultAddresses,
        startDrawId,
        lastDrawId
      )

      const calls: {
        functionName: 'getVaultUserBalanceAndTotalSupplyTwab'
        args: [Address, Address, number, number]
      }[] = []
      vaults.forEach((vault) => {
        vault.userAddresses.forEach((userAddress) => {
          calls.push({
            functionName: 'getVaultUserBalanceAndTotalSupplyTwab',
            args: [vault.address, userAddress, startDrawId, lastDrawId]
          })
        })
      })

      const multicallResults = await getSimpleMulticallResults(
        publicClient,
        prizePool.address,
        prizePoolABI,
        calls
      )

      const vaultUserOdds: {
        [vaultId: string]: { userAddress: Lowercase<Address>; odds: number }[]
      } = {}

      let multicallIndex = 0
      vaults.forEach((vault) => {
        const vaultId = getVaultId({ chainId, address: vault.address })

        vault.userAddresses.forEach((_userAddress) => {
          const result = multicallResults[multicallIndex++]

          if (!!result) {
            const userTwab = typeof result[0] === 'bigint' ? result[0] : 0n
            const vaultTwab = typeof result[1] === 'bigint' ? result[1] : 0n

            if (!!userTwab && !!vaultTwab) {
              if (vaultUserOdds[vaultId] === undefined) {
                vaultUserOdds[vaultId] = []
              }

              const userAddress = lower(_userAddress)
              const odds = divideBigInts(userTwab, vaultTwab, 18)

              vaultUserOdds[vaultId].push({ userAddress, odds })
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

            newUserOdds[userAddress] += odds * vaultPortion
          })
        }
      })

      await updateHandler(event, chainId, newUserOdds)
    } else {
      throw new Error('Invalid network config')
    }
  } catch (e) {
    console.error(e)
  }
}
