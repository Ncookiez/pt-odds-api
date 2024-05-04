import { Network } from './constants'
import { UserOdds } from './types'
import { updateHandler } from './updateHandler'

export const updateOdds = async (event: ScheduledEvent, chainId: Network) => {
  try {
    // TODO: get total contributions in the last gpDraws

    const newUserOdds: UserOdds = { total: 0, users: [] }

    // TODO: get all vault addresses
    // TODO: get total contributions in the last gpDraws for each of them
    // TODO: get total twab in the last gpDraws for each of them

    // TODO: get all users in each of the vaults
    // TODO: get twab in the last gpDraws for each of them

    // TODO: calculate user odds based on total and all vaults and add to newUserOdds.users

    return updateHandler(event, chainId, newUserOdds)
  } catch (e) {
    console.error(e)
    return undefined
  }
}
