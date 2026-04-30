'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TeamTask
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/projects" className="nav-link">Projects</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {user.name} <span className="badge" style={{ marginLeft: '0.5rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>{user.role}</span>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
