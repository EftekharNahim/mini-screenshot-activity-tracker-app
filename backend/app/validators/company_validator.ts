import vine from '@vinejs/vine'

export const companySignupValidator = vine.compile(
  vine.object({
    owner_name: vine.string().trim().minLength(2).maxLength(255),
    owner_email: vine.string().email().normalizeEmail(),
    company_name: vine.string().trim().minLength(2).maxLength(255),
    password: vine.string().minLength(6).maxLength(255),
    plan_id: vine.number().positive()
  })
)

export const companyLoginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string()
  })
)

