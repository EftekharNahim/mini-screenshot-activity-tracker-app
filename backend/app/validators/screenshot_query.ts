// app/validators/screenshot_query.ts
import vine from '@vinejs/vine'

export const screenshotQueryValidator = vine.compile(
  vine.object({
    employee_id: vine.number().positive(),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
)