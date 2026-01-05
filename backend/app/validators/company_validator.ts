import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  'required': '{{ field }} is required',
  'owner_name.minLength': 'Name must be at least 3 characters', 
  'owner_email.email': 'Invalid email format',
  'company_name.minLength': 'Company name too short',
  'password.minLength': 'Minimum 6 characters required',
  'plan_id.required': 'Please select a plan',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)

export const companySignupValidator = vine.compile(
  vine.object({
    owner_name: vine.string().trim().minLength(3).maxLength(255),
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

