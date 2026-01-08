import { BaseSeeder } from '@adonisjs/lucid/seeders'

import hash from '@adonisjs/core/services/hash'
import { faker } from '@faker-js/faker'
export default class extends BaseSeeder {
  async run() {
    console.log('Fetching company IDs...')
    const companies = await this.client.from('companies').select('id')
    if (!companies.length) {
      throw new Error('No companies found. Run CompanySeeder first.')
    }
    const companyIds = companies.map((c) => c.id)

    const TOTAL_USERS = 20_000
    const CHUNK = 2000 // adjust if you need smaller memory footprint

    // Pre-hash a common password to speed up seeding
    const commonPassword = 'Password123!'
    const hashedPassword = await hash.make(commonPassword)

    console.log(`Seeding ${TOTAL_USERS} users in chunks of ${CHUNK}...`)
    for (let start = 0; start < TOTAL_USERS; start += CHUNK) {
      const batch = []
      const end = Math.min(start + CHUNK, TOTAL_USERS)
      for (let i = start; i < end; i++) {
        const companyId = companyIds[Math.floor(Math.random() * companyIds.length)]
        const role = Math.random() < 0.15 ? 'admin' : 'employee' // ~15% admins
        const name = faker.person.fullName()
        const email = faker.internet.email({ firstName: name.split(' ')[0] }) + `.${i}@example.com`
        batch.push({
          company_id: companyId,
          name,
          email,
          role,
          password: hashedPassword,
          token_version: faker.number.int({ min: 0, max: 5 }),
          is_active: faker.datatype.boolean(),
          created_at: faker.date.past({ years: 1 }),
          updated_at: faker.date.recent({ days: 30 }),
        })
      }

      await this.client.table('users').multiInsert(batch)
      console.log(`Inserted users ${start + 1}..${end}`)
    }

    console.log('Users seeded.')
  }
}