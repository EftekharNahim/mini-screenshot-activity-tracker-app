import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('company_id').unsigned().notNullable()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.integer('token_version').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      
      table.foreign('company_id').references('companies.id').onDelete('CASCADE')
      table.unique(['company_id', 'email'])
      table.index(['company_id', 'email'])
      table.index('email')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}