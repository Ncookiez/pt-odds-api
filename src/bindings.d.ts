import { Network } from './constants'

export {}

declare global {
  const USER_ODDS: KVNamespace
  const OLD_USER_ODDS: KVNamespace
  const USER_PRIZES: KVNamespace
  const OLD_USER_PRIZES: KVNamespace
  const NETWORK: Network
  const RPC_URL: string
}
