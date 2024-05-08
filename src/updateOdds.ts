import {
  PrizePool,
  divideBigInts,
  getVaultId,
  lower,
  prizePoolABI
} from '@generationsoftware/hyperstructure-client-js'
import { Network, PRIZE_POOLS, VIEM_CLIENTS } from './constants'
import { getSubgraphVaults } from './subgraphs'
import { updateHandler } from './updateHandler'
import { UserOdds } from './types'
import type { Address } from 'viem'

export const updateOdds = async (event: FetchEvent | ScheduledEvent, chainId: Network) => {
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

      const vaultPortions = await prizePool.getVaultContributedPercentages(
        vaultAddresses,
        startDrawId,
        lastDrawId
      )

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

      const multicallResults = await publicClient.multicall({ contracts, batchSize: 1024 * 1024 })

      const vaultUserOdds: {
        [vaultId: string]: { userAddress: Lowercase<Address>; odds: number }[]
      } = {}

      let multicallIndex = 0
      vaults.forEach((vault) => {
        const vaultId = getVaultId({ chainId, address: vault.address })

        vault.userAddresses.forEach((_userAddress) => {
          const call = multicallResults[multicallIndex++]

          if (call.status === 'success') {
            const [userTwab, vaultTwab] = call.result

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

      const newUserOdds: UserOdds = {}

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

      await updateHandler(event, chainId, newUserOdds)
    } else {
      throw new Error('Invalid network config')
    }
  } catch (e) {
    console.error(e)
  }
}
