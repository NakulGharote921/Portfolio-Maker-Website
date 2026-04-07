import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at?: string
}

// Empty interface kept for potential future extensions or typing flexibility
export interface AuthErrorResponse {}

export interface AuthUser extends User {}
