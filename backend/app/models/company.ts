import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Plan from './plan.js'
import User from './user.js'
import Screenshot from './screenshot.js'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companyName: string

  @column()
  declare planId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Plan)
  declare plan: BelongsTo<typeof Plan>

  @hasMany(() => User)
  declare employees: HasMany<typeof User>

  @hasMany(() => Screenshot)
  declare screenshots: HasMany<typeof Screenshot>
}
