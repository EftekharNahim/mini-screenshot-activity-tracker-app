import { BaseSeeder } from '@adonisjs/lucid/seeders'
export default class extends BaseSeeder {
  

  async run() {
    // Write your database queries inside the run method
    const companies = []

    for (let i = 1; i <= 100; i++) {
      companies.push({
        company_name: `Company ${i}`,
        plan_id: i % 3 === 0 ? 3 : (i % 3), // Distribute planIds 1,2,3
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    await this.client.table('companies').multiInsert(companies)
  }
}