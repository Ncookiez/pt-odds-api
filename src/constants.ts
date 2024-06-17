import { base, optimism, arbitrum } from 'viem/chains'
import { createPublicClient, http } from 'viem'
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
  optimism = 10,
  base = 8453,
  arbitrum = 42161
}

export const CHAINS: Record<Network, Chain> = {
  [optimism.id]: optimism,
  [base.id]: base,
  [arbitrum.id]: arbitrum
}

export const PRIZE_POOLS: Record<
  Network,
  {
    address: Address
    gpDraws: number
    prizeToken: { decimals: number }
  }
> = {
  [Network.optimism]: {
    address: '0xF35fE10ffd0a9672d0095c435fd8767A7fe29B55',
    gpDraws: 91,
    prizeToken: { decimals: 18 }
  },
  [Network.base]: {
    address: '0x45b2010d8A4f08b53c9fa7544C51dFd9733732cb',
    gpDraws: 91,
    prizeToken: { decimals: 18 }
  },
  [Network.arbitrum]: {
    address: '0x52E7910C4C287848C8828e8b17b8371f4Ebc5D42',
    gpDraws: 91,
    prizeToken: { decimals: 18 }
  }
}

export const VIEM_CLIENT = createPublicClient({ chain: CHAINS[NETWORK], transport: http(RPC_URL) })
