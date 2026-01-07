import Cookies from 'js-cookie'

export const cookieUtils = {
  // Get cookie value
  get: (name: string): string | undefined => {
    return Cookies.get(name)
  },

  // Set cookie (not used much since backend sets HTTP-only cookies)
  set: (name: string, value: string, options?: Cookies.CookieAttributes) => {
    Cookies.set(name, value, options)
  },

  // Remove cookie
  remove: (name: string) => {
    Cookies.remove(name)
  },

  // Check if cookie exists
  has: (name: string): boolean => {
    return Cookies.get(name) !== undefined
  }
}