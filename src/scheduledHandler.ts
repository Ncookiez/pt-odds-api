import { updateOdds } from './updateOdds'

export const handleScheduled = async (event: ScheduledEvent): Promise<boolean> => {
  try {
    await updateOdds(event)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
