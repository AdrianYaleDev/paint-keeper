import { createClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { signUpWithEmail } from './auth'

describe('sign-up confirmation redirect', () => {
  it.each(['https://paint.example', 'http://localhost:5173'])(
    'sends the app URL for %s to Supabase',
    async origin => {
      const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ user: null, session: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      const client = createClient('https://project.supabase.co', 'test-publishable-key', {
        global: { fetch: fetchMock },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })

      const { error } = await signUpWithEmail(client, 'painter@example.test', 'password123', origin)
      expect(error).toBeNull()
      expect(fetchMock).toHaveBeenCalledOnce()
      const [input, init] = fetchMock.mock.calls[0]!
      const url = new URL(String(input))
      expect(url.pathname).toBe('/auth/v1/signup')
      expect(url.searchParams.get('redirect_to')).toBe(`${origin}/`)
      expect(JSON.parse(String(init?.body))).toMatchObject({ email: 'painter@example.test', password: 'password123' })
    },
  )
})
