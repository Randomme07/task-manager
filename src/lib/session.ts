import { cookies } from 'next/headers'
import { decrypt } from './auth'

export async function getSession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = await decrypt(cookie || '')
  return session?.user ? session.user : null
}
