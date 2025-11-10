import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Creating test data...')

  // 1. Create test user
  const user = await prisma.user.upsert({
    where: { fid: 999999 },
    update: {},
    create: {
      fid: 999999,
      username: 'testuser',
      displayName: 'Test User',
      signerUuid: 'test-signer-uuid-replace-with-real',
    },
  })
  console.log('✅ User created:', user.username)

  // 2. Create scheduled cast for 2 minutes from now
  const scheduledTime = new Date(Date.now() + 2 * 60 * 1000)

  const cast = await prisma.scheduledCast.create({
    data: {
      userId: user.id,
      content: '🧪 Test cast from Farcaster Scheduler! Worker is running correctly. 🎉',
      scheduledTime,
      status: 'PENDING',
      priority: 'NORMAL',
      mediaUrls: [],
    },
  })

  console.log('✅ Scheduled cast created:')
  console.log('   - ID:', cast.id)
  console.log('   - Content:', cast.content)
  console.log('   - Scheduled for:', scheduledTime.toISOString())
  console.log('   - Status:', cast.status)

  console.log('\n⏰ Cast will be published in 2 minutes')
  console.log('📊 Check worker logs to see it being processed')

  // 3. Show upcoming casts
  const upcoming = await prisma.scheduledCast.findMany({
    where: { status: 'PENDING' },
    orderBy: { scheduledTime: 'asc' },
    take: 5,
    include: { user: true },
  })

  console.log('\n📋 Upcoming casts:')
  upcoming.forEach((c, i) => {
    console.log(`   ${i + 1}. [${c.scheduledTime.toISOString()}] ${c.content.substring(0, 50)}...`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
