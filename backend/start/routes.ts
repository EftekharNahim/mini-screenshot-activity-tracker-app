import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Health check
router.get('/health', async () => {
  return {
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  }
})

// Company routes
router.group(() => {
  router.get('/plans', '#controllers/companies_controller.plans')
  router.post('/signup', '#controllers/companies_controller.signup')
  router.post('/login', '#controllers/companies_controller.login')
}).prefix('/api/company')

// Employee routes
router.group(() => {
  // Admin only routes
  router.post('/add', '#controllers/employees_controller.add')
    .use(middleware.authAdmin())
  
  router.get('/list', '#controllers/employees_controller.list')
    .use(middleware.authAdmin())
  
  router.get('/search', '#controllers/employees_controller.search')
    .use(middleware.authAdmin())
  
  router.patch('/:id/toggle-status', '#controllers/employees_controller.toggleStatus')
    .use(middleware.authAdmin())
  
  // Employee routes
  router.post('/login', '#controllers/employees_controller.login')
  
  router.post('/rotate-token', '#controllers/employees_controller.rotateToken')
    .use(middleware.authEmployee())
}).prefix('/api/employee')

// Screenshot routes
router.group(() => {
  // Employee only
  router.post('/upload', '#controllers/screenshots_controller.upload')
    .use(middleware.authEmployee())
  
  // Admin only
  router.get('/dashboard', '#controllers/screenshots_controller.dashboard')
    .use(middleware.authAdmin())
  
  router.get('/summary/:employee_id', '#controllers/screenshots_controller.summary')
    .use(middleware.authAdmin())
  
  router.get('/file/:id', '#controllers/screenshots_controller.file')
    .use(middleware.authAdmin())
}).prefix('/api/screenshots')