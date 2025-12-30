import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Company from './company.js'
import Employee from './employee.js'

export default class Screenshot extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companyId: number

  @column()
  declare employeeId: number

  @column()
  declare filePath: string

  @column()
  declare fileSize: number | null

  @column.dateTime()
  declare uploadedAt: DateTime

  @column.date()
  declare screenshotDate: DateTime

  @column()
  declare screenshotHour: number

  @column()
  declare screenshotMinute: number

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}