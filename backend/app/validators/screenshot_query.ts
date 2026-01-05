// app/validators/screenshot_query.ts
import vine,{SimpleMessagesProvider} from '@vinejs/vine'

const screenshotMessages = {
  'employee_id.required': 'Please select an employee to view screenshots.',
  'employee_id.number': 'The employee ID must be a valid number.',
  'employee_id.positive': 'Invalid employee selection.',
  
  'date.required': 'A date is required to filter screenshots.',
  'date.regex': 'Date must be in the format YYYY-MM-DD (e.g., 2024-10-25).',
}

vine.messagesProvider = new SimpleMessagesProvider(screenshotMessages)

export const screenshotQueryValidator = vine.compile(
  vine.object({
    employee_id: vine.number().positive(),
    date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
)