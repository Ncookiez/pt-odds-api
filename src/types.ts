import { Address } from 'viem'

export interface Data {
  [userAddress: Lowercase<Address>]: number
}

export interface Metadata {
  lastUpdated: string
}

export interface SubgraphVault {
  address: Address
  userAddresses: Address[]
}
