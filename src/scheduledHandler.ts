import { updateOdds, updatePrizes } from './updaters'

export const handleScheduled = async (event: ScheduledEvent) => {
  const newOdds = await updateOdds(event)
  const newPrizes = await updatePrizes(event)

  if (!newOdds || !newPrizes) throw new Error('Failed to update on schedule')
}
