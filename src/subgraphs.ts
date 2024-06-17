import {
  SUBGRAPH_API_URLS,
  getNiceNetworkNameByChainId
} from '@generationsoftware/hyperstructure-client-js'
import { Address } from 'viem'
import type { SubgraphVault } from './types'

export const getSubgraphVaults = async () => {
  const vaults: SubgraphVault[] = []
  const vaultAddresses = new Set<Address>()
  const pageSize = 1_000
  let vaultsPage = 0

  while (true) {
    let usersPage = 0

    while (true) {
      let needsNewUsersPage = false

      const newPage = await getSubgraphVaultsPage({
        numVaults: pageSize,
        numUsers: pageSize,
        offsetVaults: vaultsPage * pageSize,
        offsetUsers: usersPage * pageSize
      })

      newPage.forEach((vault) => {
        if (vaultAddresses.has(vault.address)) {
          if (vault.userAddresses.length > 0) {
            const vaultIndex = vaults.findIndex((v) => v.address === vault.address)
            vaults[vaultIndex].userAddresses.push(...vault.userAddresses)
          }
        } else {
          vaults.push(vault)
          vaultAddresses.add(vault.address)
        }

        if (vault.userAddresses.length >= pageSize) {
          needsNewUsersPage = true
        }
      })

      if (needsNewUsersPage) {
        usersPage++
      } else {
        break
      }
    }

    if (vaults.length < (vaultsPage + 1) * pageSize) {
      break
    } else {
      vaultsPage++
    }
  }

  return vaults
}

export const getSubgraphVaultsPage = async (options?: {
  numVaults?: number
  numUsers?: number
  offsetVaults?: number
  offsetUsers?: number
}): Promise<SubgraphVault[]> => {
  if (NETWORK in SUBGRAPH_API_URLS) {
    const subgraphUrl = SUBGRAPH_API_URLS[NETWORK]

    const headers = { 'Content-Type': 'application/json' }

    const body = JSON.stringify({
      query: `query($numVaults: Int, $numUsers: Int, $offsetVaults: Int, $offsetUsers: Int) {
        prizeVaults(first: $numVaults, skip: $offsetVaults) {
          address
          accounts(first: $numUsers, skip: $offsetUsers) {
            user { address }
          }
        }
      }`,
      variables: {
        numVaults: options?.numVaults ?? 1_000,
        numUsers: options?.numUsers ?? 1_000,
        offsetVaults: options?.offsetVaults ?? 0,
        offsetUsers: options?.offsetUsers ?? 0
      }
    })

    const result = await fetch(subgraphUrl, { method: 'POST', headers, body })
    const jsonData: {
      data?: { prizeVaults?: { address: string; accounts: { user: { address: string } }[] }[] }
    } = await result.json()
    const vaults = jsonData?.data?.prizeVaults ?? []

    const formattedVaults = vaults.map((vault) => ({
      address: vault.address as Address,
      userAddresses: vault.accounts.map((account) => account.user.address as Address)
    }))

    return formattedVaults
  } else {
    console.warn(`No ${getNiceNetworkNameByChainId(NETWORK)} Subgraph`)
    return []
  }
}
