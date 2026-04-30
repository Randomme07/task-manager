'use client'

import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  status: string
  dueDate: string | null
  project: { name: string }
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="container">Loading dashboard...</div>

  const todo = tasks.filter(t => t.status === 'TODO').length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const done = tasks.filter(t => t.status === 'DONE').length
  const overdue = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()).length

  return (
    <div className="container">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass" style={{ borderLeft: '4px solid #94a3b8' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>To Do</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{todo}</p>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{inProgress}</p>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{done}</p>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Overdue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: overdue > 0 ? '#ef4444' : 'inherit' }}>{overdue}</p>
        </div>
      </div>

      <div className="card glass">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Recent Tasks</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0' }}>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 5).map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{task.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{task.project.name}</td>
                    <td>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
