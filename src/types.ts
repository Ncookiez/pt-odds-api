import { Address } from 'viem'

export interface UserOdds {
  total: number
  users: { address: Lowercase<Address>; odds: number }[]
}

export interface SubgraphVault {
  address: Address
  userAddresses: Address[]
}
