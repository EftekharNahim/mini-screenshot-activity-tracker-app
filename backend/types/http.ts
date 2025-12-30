declare module '@adonisjs/core/http' {
  interface Request {
    employee?: {
      id: number
      name: string
      email: string
      companyId: number
      companyName: string
    }
    company?: {
      id: number
      companyName: string
      ownerName: string
      ownerEmail: string
      planId: number | null
      plan?: any
    }
  }
}