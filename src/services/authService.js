import { supabase } from '@/lib/supabase'
import { USER_ROLES } from '@/utils/constants'

export async function signUpAdmin({ email, password, displayName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: USER_ROLES.ADMIN,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signInAdmin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, created_at')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
