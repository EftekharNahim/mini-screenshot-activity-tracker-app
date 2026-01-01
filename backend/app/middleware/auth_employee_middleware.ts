import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/jwt_service'
import Employee from '#models/employee'

export default class AuthEmployeeMiddleware {
  public async handle({ request, response }: HttpContext, next: NextFn) {
    try {
      const authHeader = request.header('authorization') || request.header('Authorization')
      const token = JwtService.extractToken(authHeader)
      const decoded = await JwtService.verifyEmployeeToken(token)

      // Fetch employee details with company in ONE query
      const employee = await Employee.query()
        .where('id', decoded.id)
        .preload('company')
        .firstOrFail()

      // Check active + token version
      if (!employee.isActive) {
        return response.status(401).json({
          success: false,
          message: 'Unauthorized: Employee is inactive'
        })
      }

      if (decoded.version !== employee.tokenVersion) {
        return response.status(401).json({
          success: false,
          message: 'Unauthorized: token has been rotated'
        })
      }

      // Attach minimal employee info to request (avoid attaching whole model)
      request.employee = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        companyId: employee.companyId,
        companyName: employee.company?.companyName ?? ''
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
