import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CompanySeeder from './data/company_seeder.js'
import UserSeeder from './data/user_seeder.js'
import ScreenshotSeeder from './data/screenshot_seeder.js'

export default class DatabaseSeeder extends BaseSeeder {
  public async run() {
    const trx = await this.client.transaction()
    
    try {
      await new CompanySeeder(trx).run()
      await new UserSeeder(trx).run()
      
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
    await new ScreenshotSeeder(this.client).run()
  }
}