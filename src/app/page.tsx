import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getSession()
  if (user) redirect('/dashboard')

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', textAlign: 'center' }}>
      <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', maxWidth: '800px' }}>
        Manage Your Team's Projects With Elegance
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px' }}>
        The ultimate role-based task manager for modern teams. Organize work, track progress, and achieve goals together.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/register" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
          Get Started Free
        </Link>
        <Link href="/login" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>
          Sign In
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="card glass" style={{ width: '300px', textAlign: 'left' }}>
          <div style={{ background: 'rgba(59,130,246,0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            📁
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Project Management</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Create projects, organize your work into dedicated workspaces.</p>
        </div>
        <div className="card glass" style={{ width: '300px', textAlign: 'left' }}>
          <div style={{ background: 'rgba(16,185,129,0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            ✅
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Task Tracking</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Kanban boards, assignments, and real-time status updates.</p>
        </div>
        <div className="card glass" style={{ width: '300px', textAlign: 'left' }}>
          <div style={{ background: 'rgba(167,139,250,0.2)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            🔒
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Role-Based Access</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Secure your workspace with Admin and Member roles.</p>
        </div>
      </div>
    </div>
  )
}
