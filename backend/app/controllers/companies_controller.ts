import type { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'
import Plan from '#models/plan'
import hash from '@adonisjs/core/services/hash'
import JwtService from '#services/jwt_service'
import { companySignupValidator , companyLoginValidator } from '../validators/company_validator.js'


export default class CompaniesController {
  /**
   * Get all available plans
   */
  async plans({ response }: HttpContext) {
    try {
      const plans = await Plan.query().orderBy('price_per_employee', 'asc')
      
      return response.json({
        success: true,
        data: plans
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error fetching plans'
      })
    }
  }

  /**
   * Company signup
   */
  async signup({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(companySignupValidator)
      
      // Check if email already exists
      const existingCompany = await Company.findBy('owner_email', payload.owner_email)
      if (existingCompany) {
        return response.status(400).json({
          success: false,
          message: 'Email already registered'
        })
      }

      // Check if plan exists
      const plan = await Plan.find(payload.plan_id)
      if (!plan) {
        return response.status(400).json({
          success: false,
          message: 'Invalid plan selected'
        })
      }

      // Hash password
      const hashedPassword = await hash.make(payload.password)

      // Create company
      const company = await Company.create({
        ownerName: payload.owner_name,
        ownerEmail: payload.owner_email,
        companyName: payload.company_name,
        ownerPassword: hashedPassword,
        planId: payload.plan_id
      })

      // Generate admin token
      const token = JwtService.generateAdminToken(company.id, company.id)

      return response.status(201).json({
        success: true,
        message: 'Company registered successfully',
        data: {
          company: {
            id: company.id,
            owner_name: company.ownerName,
            owner_email: company.ownerEmail,
            company_name: company.companyName,
            plan_id: company.planId
          },
          token
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error creating company account',
        errors: error.messages || error.message
      })
    }
  }

  /**
   * Company login
   */
  async login({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(companyLoginValidator)

      // Find company
      const company = await Company.query()
        .where('owner_email', payload.email)
        .preload('plan')
        .first()

      if (!company) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Verify password
      const isValidPassword = await hash.verify(company.ownerPassword, payload.password)
      
      if (!isValidPassword) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Generate token
      const token = JwtService.generateAdminToken(company.id, company.id)

      return response.json({
        success: true,
        message: 'Login successful',
        data: {
          company: {
            id: company.id,
            owner_name: company.ownerName,
            owner_email: company.ownerEmail,
            company_name: company.companyName,
            plan_id: company.planId,
            plan_name: company.plan?.name,
            price_per_employee: company.plan?.pricePerEmployee
          },
          token
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error logging in',
        errors: error.messages || error.message
      })
    }
  }
}