import React from 'react'

export default function Header({ page, setPage }) {
  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>⚕</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
            PharmaQMS
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Customer Complaint Management
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '4px' }}>
        {['Log Complaint', 'Dashboard'].map(tab => (
          <button
            key={tab}
            onClick={() => setPage(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: page === tab ? '#eff6ff' : 'transparent',
              color: page === tab ? '#2563eb' : '#64748b',
              fontWeight: page === tab ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div style={{
        fontSize: 13,
        color: '#64748b',
        background: '#f8fafc',
        padding: '4px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0'
      }}>
        API & FDF Quality Assurance
      </div>
    </header>
  )
}