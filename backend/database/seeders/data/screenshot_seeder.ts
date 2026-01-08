import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Screenshot from '#models/screenshot'
import Company from '#models/company'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export default class ScreenshotSeeder extends BaseSeeder {
  public async run() {
    const totalScreenshots = 1000
    const chunkSize = 1000

    console.log('🚀 Starting Screenshot Seeder...')

    // Fetch all companies
    console.log('📦 Fetching all companies...')
    const companies = await Company.all()
    const companyIds = companies.map((c) => c.id)
    console.log(`✅ Found ${companyIds.length} companies.`)


    // Fetch all users
    console.log('👤 Fetching all users...')
    const users = await User.all()
    const userIds = users.map((u) => u.id)
    console.log(`✅ Found ${userIds.length} users.`)

    if (companyIds.length === 0 || userIds.length === 0) {
      console.log('❌ No companies or users found. Please seed them first.')
      return
    }

    console.log(`📝 Seeding ${totalScreenshots} screenshots in chunks of ${chunkSize}...`)

    // Define date range for created_at
    const startDate = DateTime.fromISO('2026-01-08')
    const endDate = DateTime.fromISO('2026-01-09')


    for (let i = 0; i < totalScreenshots; i += chunkSize) {
      const screenshots: Partial<Screenshot>[] = []

      for (let j = 0; j < chunkSize && i + j < totalScreenshots; j++) {
        const companyId = companyIds[Math.floor(Math.random() * companyIds.length)]
        const employeeId = userIds[Math.floor(Math.random() * userIds.length)]

        // ✅ Correct Faker usage for TypeScript
        const created_at = faker.date.between({
          from: startDate.toJSDate(),
          to: endDate.toJSDate(),
        })
        const createDateTime = DateTime.fromJSDate(created_at)
   

        screenshots.push({
          companyId,
          employeeId,
          filePath: 'https://res.cloudinary.com/ddqobowri/image/upload/v1767763021/image_of_screenshots/whqxa9l0xja9yhlsx4rl.png',
          fileSize: faker.number.int({ min: 50000, max: 5000000 }),
          uploadedAt: createDateTime,
          // Virtual columns will be auto-calculated in the DB
        
        })
      }

      await Screenshot.createMany(screenshots)
      console.log(
        `📌 Inserted ${i + screenshots.length} / ${totalScreenshots} screenshots so far...`
      )
    }

    console.log('🎉 All screenshots seeded successfully!')
  }
}
