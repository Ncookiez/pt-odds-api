import { optimism } from 'viem/chains'
import type { Address, Chain } from 'viem'

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

export const VIEM_CHAINS: Record<Network, Chain> = {
  [Network.optimism]: optimism
}

export const NETWORKS = Object.keys(VIEM_CHAINS).map((id) => parseInt(id) as Network)

export const PRIZE_POOLS: Record<Network, { address: Address; gpDraws: number }> = {
  [Network.optimism]: {
    address: '0xF35fE10ffd0a9672d0095c435fd8767A7fe29B55',
    gpDraws: 91
  }
}

export const RPC_URLS: Record<Network, string> = {
  [Network.optimism]: OPTIMISM_RPC_URL
}

export const SUBGRAPH_URLS: Record<Network, string> = {
  [Network.optimism]: 'https://api.studio.thegraph.com/query/63100/pt-v5-optimism/version/latest'
}

export const TOKEN_PRICES_API_URL = 'https://token-prices.api.cabana.fi'
