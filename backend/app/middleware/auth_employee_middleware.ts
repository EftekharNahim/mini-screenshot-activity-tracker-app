import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/jwt_service'
import Employee from '#models/employee'

export default class AuthEmployeeMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    try {
      const authHeader = request.header('Authorization')
      const token = JwtService.extractToken(authHeader)
      const decoded = await JwtService.verifyEmployeeToken(token)
      
      // Fetch employee details with company
      const employee = await Employee.query()
        .where('id', decoded.id)
        .preload('company')
        .firstOrFail()
      
      // Attach to request
      request.employee = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        companyId: employee.companyId,
        companyName: employee.company.companyName
      }
      
      await next()
    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token'
      })
    }
  }
}