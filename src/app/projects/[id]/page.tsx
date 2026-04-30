'use client'

import { useEffect, useState, use } from 'react'

type Task = {
  id: string
  title: string
  description: string
  status: string
  dueDate: string | null
  assignee: { id: string, name: string } | null
}

type User = {
  id: string
  name: string
  role: string
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchTasks = () => {
    fetch(`/api/tasks?projectId=${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTasks(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTasks()
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data)
      })
  }, [projectId])

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        status: 'TODO',
        dueDate: formData.get('dueDate') || null,
        projectId,
        assigneeId: formData.get('assigneeId') || null
      })
    })

    if (res.ok) {
      setShowModal(false)
      fetchTasks()
    } else {
      alert('Failed to create task. Only Admins can create tasks.')
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (res.ok) {
      fetchTasks()
    } else {
      alert('Failed to update task. You must be an Admin or the assigned member.')
    }
  }

  const columns = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Completed' }
  ]

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Task Board</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Task</button>
      </div>

      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
          {columns.map(col => (
            <div key={col.id} className="glass" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{col.title}</h2>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="card glass" style={{ padding: '1rem', background: 'var(--surface-color)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{task.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {task.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                      <select 
                        className="input" 
                        style={{ width: 'auto', padding: '0.25rem', fontSize: '0.75rem', border: 'none', background: 'rgba(255,255,255,0.1)' }}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="card glass modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Task Title</label>
                <input name="title" className="input" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" className="input" rows={3} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Assignee</label>
                  <select name="assigneeId" className="input">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Due Date</label>
                  <input name="dueDate" type="date" className="input" />
                </div>
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
