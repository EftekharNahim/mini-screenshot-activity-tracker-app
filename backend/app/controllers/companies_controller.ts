import type { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'
import Plan from '#models/plan'
import hash from '@adonisjs/core/services/hash'
import JwtService from '#services/jwt_service'
import { companySignupValidator, companyLoginValidator } from '../validators/company_validator.js'
import User from '#models/user'


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
      console.log(payload);
      // Check if email already exists
      const existingCompany = await User.findBy('email', payload.owner_email)
      console.log(existingCompany);
      if (existingCompany) {
        return response.status(400).json({
          success: false,
          message: 'Email already registered'

        })
      }

      // Check if plan exists
      const plan = await Plan.find(payload.plan_id)
      console.log('plan : ', plan);
      if (!plan) {
        console.log('Invalid plan selected');
        return response.status(400).json({
          success: false,
          message: 'Invalid plan selected'
        })
      }

      // Hash password
      const hashedPassword = await hash.make(payload.password)
      console.log('Hashed password:', payload);
      // Create company
      const company = await Company.create({
        companyName: payload.company_name,
        planId: payload.plan_id
      })

      console.log('Company created:', company);

      // Create admin user
      await User.create({
        companyId: company.id,
        name: payload.owner_name,
        email: payload.owner_email,
        password: hashedPassword,
        role: 'admin',
        tokenVersion: 0
      })
      console.log('Company created with ID:', company.id);
      // Generate admin token
      const token = JwtService.generateAdminToken(company.id, company.id)
      console.log('Generated token:', token);

      // Set HTTP-only cookie
      response.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: '30d', // 30 days
        path: '/'
      })

      // Set user type cookie (not sensitive)
      response.cookie('userType', 'admin', {
        httpOnly: false, // Can be read by JS for routing
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: '30d',
        path: '/'
      })

      return response.status(201).json({
        success: true,
        message: 'Company registered successfully',
        data: {
          company: {
            id: company.id,
            company_name: company.companyName,
            plan_id: company.planId

          },
          token
        }
      })
    } catch (error) {
      console.log("🚀 ~ CompaniesController ~ signup ~ error:", error)
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

      // Find user
      const user = await User.query()
        .where('email', payload.email)
        .andWhere('role', 'admin')
        .first()

      if (!user) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }
      // Verify password
      const isValidPassword = await hash.verify(user.password, payload.password)

      if (!isValidPassword) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }
      // Fetch company
      const company = await Company.find(user.companyId)
      if (!company) {
        return response.status(500).json({
          success: false,
          message: 'Associated company not found'
        })
      }
      await company.load('plan')
      // Generate token
      const token = JwtService.generateAdminToken(company.id, company.id)

      // Set HTTP-only cookie
      response.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: '30d',
        path: '/'
      })

      response.cookie('userType', 'admin', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: '30d',
        path: '/'
      })

      return response.json({
        success: true,
        message: 'Login successful',
        data: {
          company: {
            id: company.id,
            owner_name: user.name,
            owner_email: user.email,
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

  /**
   * Logout
   */
  async logout({ response }: HttpContext) {
    response.clearCookie('authToken')
    response.clearCookie('userType')

    return response.json({
      success: true,
      message: 'Logged out successfully'
    })
  }
}