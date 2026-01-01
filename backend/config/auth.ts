import { defineConfig } from '@adonisjs/auth';
import { jwtGuard } from '@maximemrf/adonisjs-jwt/jwt_config'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'


const authConfig = defineConfig({
  default: 'jwt',

  guards: {
    jwt: jwtGuard({
      secret: process.env.JWT_SECRET!,
      expiresIn: '', // No expiration for employee tokens',
    }),

    admin: jwtGuard({
      secret: process.env.JWT_ADMIN_SECRET!,
      expiresIn: '30d',
    }),
  },
})

export default authConfig

/**
 * Types
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
