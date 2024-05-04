import { NETWORKS } from './constants'
import { updateOdds } from './updateOdds'

export const handleScheduled = async (event: ScheduledEvent): Promise<boolean> => {
  try {
    await Promise.allSettled(NETWORKS.map((network) => (async () => updateOdds(event, network))()))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
