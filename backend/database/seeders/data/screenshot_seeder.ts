import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ScreenshotSeeder extends BaseSeeder {
  public async run() {
    console.log('Fetching users for screenshot mapping...')
    
    // Use this.client instead of global Database
    const users = await this.client.from('users').select('id', 'company_id')
    if (!users.length) {
      throw new Error('No users found. Run UserSeeder first.')
    }

    const TOTAL_SCREENSHOTS = 1000000
    const CHUNK = 5000
    
    // Pre-calculate date range to avoid Luxon overhead inside the loop
    const nowTs = Date.now()
    const twoYearsAgoTs = nowTs - (2 * 365 * 24 * 60 * 60 * 1000)

    console.log(`Seeding ${TOTAL_SCREENSHOTS} screenshots...`)

    for (let start = 0; start < TOTAL_SCREENSHOTS; start += CHUNK) {
      const batch = []
      const end = Math.min(start + CHUNK, TOTAL_SCREENSHOTS)

      for (let i = start; i < end; i++) {
        const user = users[Math.floor(Math.random() * users.length)]
        
        // Fast random date generation
        const randomTs = Math.floor(Math.random() * (nowTs - twoYearsAgoTs) + twoYearsAgoTs)
        const d = new Date(randomTs)
        
        // Manual formatting is much faster than Luxon for 2M iterations
        const uploadedAt = d.toISOString() // "YYYY-MM-DDTHH:mm:ss.sssZ"
        const screenshotDate = uploadedAt.split('T')[0]

        batch.push({
          company_id: user.company_id,
          employee_id: user.id,
          file_path: `https://res.cloudinary.com/dktsviile/image/upload/v1767681249/screenshots/1/3/screenshot-1767681312220.png`,
          file_size: Math.floor(Math.random() * (2000000 - 10000) + 10000),
          uploaded_at: uploadedAt,
          screenshot_date: screenshotDate,
          screenshot_hour: d.getUTCHours(),
          screenshot_minute: d.getUTCMinutes(),
        })
      }

      // Use this.client.table() to stay within the DatabaseSeeder transaction
      await this.client.table('screenshots').multiInsert(batch)
      
      if (start % 50000 === 0) {
        console.log(`Progress: ${((start / TOTAL_SCREENSHOTS) * 100).toFixed(1)}%`)
      }
    }

    console.log('Screenshots seeded successfully.')
  }
}