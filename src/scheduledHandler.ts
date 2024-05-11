import { updateOdds } from './updateOdds'
import { NETWORKS } from './constants'
import { updatePrizes } from './updatePrizes'

export const handleScheduled = async (event: ScheduledEvent): Promise<boolean> => {
  try {
    await Promise.allSettled(
      NETWORKS.map((network) =>
        (async () => {
          await updateOdds(event, network)
          await updatePrizes(event, network)
        })()
      )
    )
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
