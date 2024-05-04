import { Address } from 'viem'

export interface UserOdds {
  [userAddress: Lowercase<Address>]: number
}

export interface SubgraphVault {
  address: Address
  userAddresses: Address[]
}
