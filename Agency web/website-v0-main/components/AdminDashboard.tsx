'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/leads')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load leads')
      }

      setLeads(result.leads || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
      console.error('Error loading leads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLead = async (id: string) => {
    if (confirm('Delete this inquiry?')) {
      try {
        const response = await fetch(`/api/leads?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete lead')
        }

        // Reload leads after deletion
        loadLeads()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete lead')
        console.error('Error deleting lead:', err)
      }
    }
  }

  const totalLeads = leads.length
  const todayStr = new Date().toLocaleDateString()
  const todayLeads = leads.filter(
    (lead) => new Date(lead.created_at).toLocaleDateString() === todayStr
  ).length

  return (
    <div className="container dashboard-container" id="dashboardScreen" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1>
            Owner <span className="text-accent">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your leads and inquiries</p>
        </div>
        <button
          onClick={onLogout}
          className="logout-btn"
          style={{
            background: 'transparent',
            border: '1px solid var(--text-secondary)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: '50px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        <div
          className="stat-card"
          style={{
            background: 'rgba(17, 17, 17, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
          }}
        >
          <div
            className="stat-value"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              marginBottom: '0.5rem',
            }}
          >
            {totalLeads}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Total Leads</div>
        </div>
        <div
          className="stat-card"
          style={{
            background: 'rgba(17, 17, 17, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
          }}
        >
          <div
            className="stat-value"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              marginBottom: '0.5rem',
            }}
          >
            {todayLeads}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>New Today</div>
        </div>
      </div>

      {/* Data Table */}
      <h3 style={{ marginBottom: '1.5rem' }}>Recent Inquiries</h3>
      {error && (
        <div
          style={{
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid #ff4757',
            color: '#ff4757',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      <div
        className="data-table-container"
        style={{
          background: 'rgba(17, 17, 17, 0.6)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)',
            }}
          >
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div
            id="noDataMsg"
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)',
            }}
          >
            No inquiries yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Phone
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Message
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <a href={`mailto:${lead.email}`} style={{ color: 'var(--accent-primary)' }}>
                      {lead.email}
                    </a>
                  </td>
                  <td style={{ padding: '1rem' }}>{lead.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem', maxWidth: '300px', opacity: 0.8 }}>
                    {lead.message}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      className="btn-action"
                      onClick={() => deleteLead(lead.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        border: 'none',
                        background: '#ff4757',
                        color: 'white',
                        transition: '0.2s',
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

