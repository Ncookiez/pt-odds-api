import { updateHandler } from './updateHandler'

export const updateOdds = async (event: ScheduledEvent) => {
  try {
    // TODO: query data, calculate odds
    // TODO: call the handler for each chain
    // return updateHandler(event, chainId, userOdds)
  } catch (e) {
    console.error(e)
    return undefined
  }
}
