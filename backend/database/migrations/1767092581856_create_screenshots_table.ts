import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'screenshots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.integer('company_id').unsigned().notNullable()
      table.integer('employee_id').unsigned().notNullable()
      table.text('file_path').notNullable()
      table.bigInteger('file_size').nullable()
      table.timestamp('uploaded_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Virtual columns for grouping (MySQL)
      table.date('screenshot_date').nullable()
      table.integer('screenshot_hour').nullable()
      table.integer('screenshot_minute').nullable()

      table.foreign('company_id').references('companies.id').onDelete('CASCADE')
      table.foreign('employee_id').references('employees.id').onDelete('CASCADE')

      // Performance indexes
      table.index(['employee_id', 'screenshot_date'])
      table.index(['company_id', 'screenshot_date'])
      table.index(['employee_id', 'uploaded_at'])
      table.index(['screenshot_date', 'screenshot_hour'])
      table.index(['employee_id', 'screenshot_date', 'screenshot_hour', 'screenshot_minute'],'screenshots_full_log_idx')
      table.index(['company_id', 'employee_id', 'screenshot_date'])
    })

    // Add generated columns using raw SQL (MySQL specific)
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      MODIFY COLUMN screenshot_date DATE GENERATED ALWAYS AS (DATE(uploaded_at)) STORED,
      MODIFY COLUMN screenshot_hour TINYINT GENERATED ALWAYS AS (HOUR(uploaded_at)) STORED,
      MODIFY COLUMN screenshot_minute TINYINT GENERATED ALWAYS AS (MINUTE(uploaded_at)) STORED
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}