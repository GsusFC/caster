import 'dotenv/config'
import { CronJob } from 'cron'
import { publisher } from '@farcaster-scheduler/core'

console.log('🚀 Starting Farcaster Scheduler Worker...')

/**
 * Main cron job - runs every minute to check for scheduled casts
 */
const job = new CronJob(
  '* * * * *', // Every minute
  async () => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] 🔄 Checking for scheduled casts...`)

    try {
      const result = await publisher.publishDueCasts()
      
      console.log(`[${timestamp}] ✅ Completed:`, {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
      })
    } catch (error) {
      console.error(`[${timestamp}] ❌ Error publishing casts:`, error)
    }
  },
  null, // onComplete
  true, // start immediately
  'America/Los_Angeles' // timezone
)

console.log('✅ Cron worker started successfully')
console.log('⏰ Running every minute...')

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')
  job.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...')
  job.stop()
  process.exit(0)
})

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  // Don't exit - let the cron keep running
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason)
  // Don't exit - let the cron keep running
})
