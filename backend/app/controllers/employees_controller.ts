import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import hash from '@adonisjs/core/services/hash'
import JwtService from '#services/jwt_service'
import { employeeCreateValidator, employeeLoginValidator } from '../validators/employee_validators.js'

export default class EmployeesController {
  /**
   * Add employee (Admin only)
   */
  async add({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(employeeCreateValidator)
      const companyId = request.company!.id

      // Check if email already exists
      const existingEmployee = await Employee.findBy('email', payload.email)
      if (existingEmployee) {
        return response.status(400).json({
          success: false,
          message: 'Email already registered'
        })
      }

      // Hash password
      const hashedPassword = await hash.make(payload.password)

      // Create employee
      const employee = await Employee.create({
        companyId,
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        tokenVersion: 0
      })

      // Generate JWT token
      const token = JwtService.generateEmployeeToken(employee.id, 0)



      return response.status(201).json({
        success: true,
        message: 'Employee added successfully',
        data: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          company_id: employee.companyId,
          token
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error adding employee',
        errors: error.messages || error.message
      })
    }
  }

  /**
   * List all employees (Admin only)
   */
  async list({ request, response }: HttpContext) {
    try {
      const companyId = request.company!.id

      const employees = await Employee.query()
        .where('company_id', companyId)
        .select('id', 'name', 'email', 'is_active', 'created_at')
        .orderBy('created_at', 'desc')

      return response.json({
        success: true,
        data: employees
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error fetching employees'
      })
    }
  }

  /**
   * Search employees by name (Admin only)
   */
  async search({ request, response }: HttpContext) {
    try {
      const companyId = request.company!.id
      const query = request.input('query')

      if (!query) {
        return response.status(400).json({
          success: false,
          message: 'Search query is required'
        })
      }

      const employees = await Employee.query()
        .where('company_id', companyId)
        .where('name', 'like', `%${query}%`)
        .select('id', 'name', 'email', 'is_active', 'created_at')
        .orderBy('name', 'asc')

      return response.json({
        success: true,
        data: employees
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error searching employees'
      })
    }
  }

  /**
   * Employee login
   */
  async login({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(employeeLoginValidator)

      // Find employee
      const employee = await Employee.query()
        .where('email', payload.email)
        .where('is_active', true)
        .preload('company')
        .first()

      if (!employee) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Verify password
      const isValidPassword = await hash.verify(employee.password, payload.password)

      if (!isValidPassword) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Generate token on the fly (do NOT save to DB)
      const token = JwtService.generateEmployeeToken(employee.id, employee.tokenVersion)


      return response.json({
        success: true,
        message: 'Login successful',
        data: {
          employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            company_id: employee.companyId,
            company_name: employee.company.companyName
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

  // /**
  //  * Rotate employee token
  //  */
  // async rotateToken({ request, response }: HttpContext) {
  //   try {
  //     const employeeId = request.employee!.id
  //     const newToken = await JwtService.rotateEmployeeToken(employeeId)

  //     return response.json({
  //       success: true,
  //       message: 'Token rotated successfully',
  //       data: { token: newToken }
  //     })
  //   } catch (error) {
  //     return response.status(500).json({
  //       success: false,
  //       message: 'Error rotating token'
  //     })
  //   }
  // }

  /**
   * Toggle employee status (Admin only)
   */
  async toggleStatus({ request, response, params }: HttpContext) {
    try {
      const companyId = request.company!.id
      const employeeId = params.id

      const employee = await Employee.query()
        .where('id', employeeId)
        .where('company_id', companyId)
        .first()

      if (!employee) {
        return response.status(404).json({
          success: false,
          message: 'Employee not found'
        })
      }

      employee.isActive = !employee.isActive
      await employee.save()

      return response.json({
        success: true,
        message: 'Employee status updated',
        data: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          is_active: employee.isActive
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error updating employee status'
      })
    }
  }
}