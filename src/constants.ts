import { createPublicClient, fallback, http } from 'viem'
import { optimism } from 'viem/chains'
import type { Address, PublicClient } from 'viem'

export const DEFAULT_HEADERS = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Request-Method': '*',
    'Vary': 'Accept-Encoding, Origin',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json;charset=UTF-8'
  }
}

export enum Network {
  optimism = 10
}

export const PRIZE_POOLS: Record<
  Network,
  {
    address: Address
    gpDraws: number
    twabController: { address: Address }
    prizeToken: { decimals: number }
  }
> = {
  [Network.optimism]: {
    address: '0xF35fE10ffd0a9672d0095c435fd8767A7fe29B55',
    gpDraws: 91,
    twabController: { address: '0xCB0672dE558Ad8F122C0E081f0D35480aB3be167' },
    prizeToken: { decimals: 18 }
  }
}

export const NETWORKS = Object.keys(PRIZE_POOLS).map((id) => parseInt(id) as Network)

export const VIEM_CLIENTS: Record<Network, PublicClient> = {
  [Network.optimism]: createPublicClient({
    chain: optimism,
    transport: fallback([http(OPTIMISM_RPC_URL), http()])
  }) as PublicClient
}
