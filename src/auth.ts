import type { SupabaseClient } from '@supabase/supabase-js'

export function signUpWithEmail(client: SupabaseClient, email: string, password: string, origin: string) {
  const emailRedirectTo = new URL(import.meta.env.BASE_URL, origin).href
  return client.auth.signUp({ email, password, options: { emailRedirectTo } })
}
