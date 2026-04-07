import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at?: string
}

export interface AuthUser extends User {}
