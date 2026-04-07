import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/auth'

export const ADMIN_EMAIL = 'adminnakul@gmail.com'

function getExpectedRole(email?: string | null): Profile['role'] {
  return email?.trim().toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user'
}

function toError(error: { message?: string } | null) {
  return new Error(error?.message || 'Supabase request failed.')
}

export async function createProfile(user: User) {
  const expectedRole = getExpectedRole(user.email)
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email ?? '',
        role: expectedRole,
      },
    ])
    .select('id, email, role')
    .single()

  if (error) {
    throw toError(error)
  }

  return data as Profile
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw toError(error)
  }

  return data as Profile | null
}

export async function ensureProfile(user: User) {
  let profile = await getProfile(user.id)
  const expectedRole = getExpectedRole(user.email)

  if (!profile) {
    profile = await createProfile(user)
  }

  if (profile.email === (user.email ?? profile.email) && profile.role === expectedRole) {
    return profile
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      email: user.email ?? profile.email,
      role: expectedRole,
    })
    .eq('id', user.id)
    .select('id, email, role')
    .single()

  if (error) {
    throw toError(error)
  }

  return data as Profile
}
