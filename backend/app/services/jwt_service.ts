import jwt from 'jsonwebtoken'
import env from '#start/env'
import Employee from '#models/employee'

interface EmployeePayload {
  id: number
  type: 'employee'
  version: number
}

interface AdminPayload {
  companyId: number
  ownerId: number
  type: 'admin'
}

export class JwtService {
  /**
   * Generate long-lived JWT token for employees (no expiration)
   */
  static generateEmployeeToken(employeeId: number, tokenVersion: number): string {
    const payload: EmployeePayload = {
      id: employeeId,
      type: 'employee',
      version: tokenVersion
    }
    
    return jwt.sign(payload, env.get('JWT_SECRET'))
  }

  /**
   * Generate admin token (company owner) with 30 days expiration
   */
  static generateAdminToken(companyId: number, ownerId: number): string {
    const payload: AdminPayload = {
      companyId,
      ownerId,
      type: 'admin'
    }
    
    return jwt.sign(payload, env.get('JWT_ADMIN_SECRET'), { expiresIn: '30d' })
  }

  // /**
  //  * Auto-rotate employee token by incrementing version
  //  */
  // static async rotateEmployeeToken(employeeId: number): Promise<string> {
  //   const employee = await Employee.findOrFail(employeeId)
    
  //   employee.tokenVersion += 1
  //   const newToken = this.generateEmployeeToken(employee.id, employee.tokenVersion)
    
  //   employee.jwtToken = newToken
  //   await employee.save()
    
  //   return newToken
  // }

  /**
   * Verify employee token and check version
   */
  static async verifyEmployeeToken(token: string): Promise<EmployeePayload> {
    try {
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as EmployeePayload
      
      if (decoded.type !== 'employee') {
        throw new Error('Invalid token type')
      }

      // Check if token version matches database
      const employee = await Employee.findOrFail(decoded.id)
      
      if (!employee.isActive) {
        throw new Error('Employee account is inactive')
      }
      
      if (decoded.version !== employee.tokenVersion) {
        throw new Error('Token has been rotated')
      }
      
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Verify admin token
   */
  static verifyAdminToken(token: string): AdminPayload {
    try {
      const decoded = jwt.verify(token, env.get('JWT_ADMIN_SECRET')) as AdminPayload
      
      if (decoded.type !== 'admin') {
        throw new Error('Invalid token type')
      }
      
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractToken(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided')
    }
    
    return authHeader.substring(7)
  }
}

export default JwtService