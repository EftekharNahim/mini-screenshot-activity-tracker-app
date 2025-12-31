import type { HttpContext } from '@adonisjs/core/http'
import Screenshot from '#models/screenshot'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import cloudinary from '#config/cloudinary'

export default class ScreenshotsController {
  /**
   * Upload screenshot to Cloudinary (Employee only)
   */
  async upload({ request, response }: HttpContext) {
    try {
      const employee = request.employee!
      
      // Get the uploaded file
      const file = request.file('screenshot', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'bmp']
      })
     console.log('Received file:', file)
      if (!file) {
        return response.status(400).json({
          success: false,
          message: 'No file uploaded'
        })
      }

      if (!file.isValid) {
        return response.status(400).json({
          success: false,
          message: file.errors[0]?.message || 'Invalid file'
        })
      }

      console.log('Uploading file to Cloudinary...', file.tmpPath)

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.tmpPath!, {
        folder: `screenshots/${employee.companyId}/${employee.id}`,
        resource_type: 'image',
        public_id: `screenshot-${Date.now()}`,
      })

      const url = uploadResult.secure_url
      const publicId = uploadResult.public_id
      
      console.log('Cloudinary URL:', url)
      console.log('Public ID:', publicId)

      // Create screenshot record in database
      const screenshot = await Screenshot.create({
        companyId: employee.companyId,
        employeeId: employee.id,
        filePath: url, // Store Cloudinary URL
        fileSize: uploadResult.bytes,
        uploadedAt: DateTime.now()
      })

      return response.status(201).json({
        success: true,
        message: 'Screenshot uploaded successfully',
        data: {
          id: screenshot.id,
          uploaded_at: screenshot.uploadedAt,
          file_size: screenshot.fileSize,
          file_path: screenshot.filePath,
          cloudinary_public_id: publicId
        }
      })
    } catch (error) {
      console.error('Upload error:', error)
      return response.status(500).json({
        success: false,
        message: 'Error uploading screenshot',
        error: error.message
      })
    }
  }

  /**
   * Get dashboard data with grouping (Admin only)
   */
  async dashboard({ request, response }: HttpContext) {
    try {
      const companyId = request.company!.id
      const employeeId = request.input('employee_id')
      const date = request.input('date')

      if (!employeeId || !date) {
        return response.status(400).json({
          success: false,
          message: 'employee_id and date are required'
        })
      }

      // Verify employee belongs to this company
      const employee = await Employee.query()
        .where('id', employeeId)
        .where('company_id', companyId)
        .first()

      if (!employee) {
        return response.status(403).json({
          success: false,
          message: 'Unauthorized access to employee data'
        })
      }

      // Get all screenshots for the employee on specified date
      const screenshots = await db.from('screenshots')
        .select(
          'id',
          'file_path',
          'file_size',
          'uploaded_at',
          'screenshot_hour',
          'screenshot_minute',
          db.raw('FLOOR(screenshot_minute / 10) as interval_10min'),
          db.raw('FLOOR(screenshot_minute / 5) as interval_5min')
        )
        .where('employee_id', employeeId)
        .where('screenshot_date', date)
        .orderBy('uploaded_at', 'asc')

      // Group screenshots by hour and intervals
      const groupedData: any = {}

      screenshots.forEach((screenshot: any) => {
        const hour = screenshot.screenshot_hour
        const interval5 = screenshot.interval_5min
        const interval10 = screenshot.interval_10min

        if (!groupedData[hour]) {
          groupedData[hour] = {
            hour: hour,
            intervals_5min: {},
            intervals_10min: {}
          }
        }

        // Group by 5-minute intervals
        if (!groupedData[hour].intervals_5min[interval5]) {
          groupedData[hour].intervals_5min[interval5] = {
            interval: interval5,
            start_minute: interval5 * 5,
            end_minute: (interval5 * 5) + 4,
            screenshots: []
          }
        }

        // Group by 10-minute intervals
        if (!groupedData[hour].intervals_10min[interval10]) {
          groupedData[hour].intervals_10min[interval10] = {
            interval: interval10,
            start_minute: interval10 * 10,
            end_minute: (interval10 * 10) + 9,
            screenshots: []
          }
        }

        const screenshotData = {
          id: screenshot.id,
          file_path: screenshot.file_path, // This is now Cloudinary URL
          file_size: screenshot.file_size,
          uploaded_at: screenshot.uploaded_at,
          minute: screenshot.screenshot_minute
        }

        groupedData[hour].intervals_5min[interval5].screenshots.push(screenshotData)
        groupedData[hour].intervals_10min[interval10].screenshots.push(screenshotData)
      })

      // Convert to array format
      const formattedData = Object.values(groupedData).map((hourData: any) => ({
        hour: hourData.hour,
        intervals_5min: Object.values(hourData.intervals_5min),
        intervals_10min: Object.values(hourData.intervals_10min)
      }))

      return response.json({
        success: true,
        data: {
          employee_id: parseInt(employeeId),
          date: date,
          total_screenshots: screenshots.length,
          grouped_by_hour: formattedData
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      })
    }
  }

  /**
   * Get screenshot summary (Admin only)
   */
  async summary({ request, response, params }: HttpContext) {
    try {
      const companyId = request.company!.id
      const employeeId = params.employee_id
      const startDate = request.input('start_date')
      const endDate = request.input('end_date')

      // Verify employee belongs to this company
      const employee = await Employee.query()
        .where('id', employeeId)
        .where('company_id', companyId)
        .first()

      if (!employee) {
        return response.status(403).json({
          success: false,
          message: 'Unauthorized access to employee data'
        })
      }

      let query = db.from('screenshots')
        .select('screenshot_date')
        .count('* as screenshot_count')
        .countDistinct('screenshot_hour as active_hours')
        .where('employee_id', employeeId)
        .groupBy('screenshot_date')
        .orderBy('screenshot_date', 'desc')

      if (startDate && endDate) {
        query = query.whereBetween('screenshot_date', [startDate, endDate])
      }

      const summary = await query

      return response.json({
        success: true,
        data: summary
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error fetching summary data',
        error: error.message
      })
    }
  }

  /**
   * Delete screenshot (Admin only)
   * Now also deletes from Cloudinary
   */
  async destroy({ request, response, params }: HttpContext) {
    try {
      const companyId = request.company!.id
      const screenshotId = params.id

      const screenshot = await Screenshot.query()
        .where('id', screenshotId)
        .preload('employee')
        .first()

      if (!screenshot) {
        return response.status(404).json({
          success: false,
          message: 'Screenshot not found'
        })
      }

      // Verify employee belongs to this company
      if (screenshot.employee.companyId !== companyId) {
        return response.status(403).json({
          success: false,
          message: 'Unauthorized access'
        })
      }

      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/screenshots/1/2/screenshot-1234567890.jpg
      const urlParts = screenshot.filePath.split('/')
      const fileName = urlParts[urlParts.length - 1].split('.')[0]
      const folder = urlParts.slice(-4, -1).join('/')
      const publicId = `${folder}/${fileName}`

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId)
        console.log('Deleted from Cloudinary:', publicId)
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }

      // Delete from database
      await screenshot.delete()

      return response.json({
        success: true,
        message: 'Screenshot deleted successfully'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error deleting screenshot',
        error: error.message
      })
    }
  }
}