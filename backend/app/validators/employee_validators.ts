import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  'required': '{{ field }} is required',
  'name.minLength': 'Name must be at least 3 characters', 
  'email.email': 'Invalid email format',
  'password.minLength': 'Minimum 6 characters required',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)

export const employeeCreateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6).maxLength(255)
  })
)

export const employeeLoginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6).maxLength(255)
  })
)