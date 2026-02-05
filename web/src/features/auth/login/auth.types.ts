export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
