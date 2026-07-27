import React from 'react'

const colors = {
  Critical      : { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Major         : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Minor         : { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Unclassified  : { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  Open          : { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'In Progress' : { bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
  Closed        : { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Pending Triage': { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

export default function StatusBadge({ label }) {
  const style = colors[label] || colors['Unclassified']
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: 12,
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      display: 'inline-block'
    }}>
      {label}
    </span>
  )
}