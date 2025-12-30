import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('company_name', 255).notNullable()
      table.string('owner_name', 255).notNullable()
      table.string('owner_email', 255).notNullable().unique()
      table.string('owner_password', 255).notNullable()
      table.integer('plan_id').unsigned().nullable()
      table.foreign('plan_id').references('plans.id').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index('owner_email')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}