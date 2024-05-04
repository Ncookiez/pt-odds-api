import { updateOdds } from './updateOdds'
import { NETWORKS } from './constants'

export const handleScheduled = async (event: ScheduledEvent): Promise<boolean> => {
  try {
    await Promise.allSettled(NETWORKS.map((network) => (async () => updateOdds(event, network))()))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
