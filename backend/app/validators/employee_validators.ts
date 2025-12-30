import vine from '@vinejs/vine'

export const employeeCreateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6).maxLength(255)
  })
)

export const employeeLoginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string()
  })
)