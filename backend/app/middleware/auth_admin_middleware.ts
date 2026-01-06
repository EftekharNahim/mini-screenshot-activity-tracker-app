import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/jwt_service'
import Company from '#models/company'

export default class AuthAdminMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    try {
      const authHeader = request.header('Authorization')
      const token = JwtService.extractToken(authHeader)
      const decoded = JwtService.verifyAdminToken(token)
      
      // Fetch company details
      const company = await Company.findOrFail(decoded.companyId) 
      
      // Attach to request
      request.company = {
        id: company.id,
        companyName: company.companyName,
        planId: company.planId,
        plan: company.plan
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
