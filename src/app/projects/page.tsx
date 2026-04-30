'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  description: string
  owner: { name: string }
  _count: { tasks: number }
  createdAt: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [userRole, setUserRole] = useState('')

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProjects()
    // A simple way to get role on client side, though better done via context.
    // For this app, we can decode the JWT or just get it from an API/storage.
    // We'll fetch a quick "me" endpoint or just check cookies.
    fetch('/api/users')
      .then(res => res.json())
      .then(() => {
        // Just setting it up. For real role check we should have a /api/auth/me
        // but let's assume we can try to create and API handles 403.
      })
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const description = formData.get('description')

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })

    if (res.ok) {
      setShowModal(false)
      fetchProjects()
    } else {
      alert('Failed to create project. Only Admins can create projects.')
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Projects</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">New Project</button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="card glass" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span>{project._count.tasks} Tasks</span>
                  <span>By {project.owner.name}</span>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="card glass modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Project Name</label>
                <input name="name" className="input" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" className="input" rows={3} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
