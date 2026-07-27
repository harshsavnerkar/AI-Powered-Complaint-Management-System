import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchComplaints, setCurrentComplaint, updateComplaintStatus, deleteComplaint } from '../store/complaintSlice'
import StatusBadge from './StatusBadge'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { list, current } = useSelector(s => s.complaints)

  useEffect(() => {
    dispatch(fetchComplaints())
  }, [dispatch])

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateComplaintStatus({ id, status: newStatus }))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      dispatch(deleteComplaint(id))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              Complaints Dashboard
            </h2>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Select a complaint to view the AI Risk Assessment, Summary, and CAPA actions.
            </p>
          </div>
          <div style={{
            background: '#eff6ff',
            color: '#2563eb',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: 13,
            fontWeight: 600
          }}>
            {list.length} Total
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {list.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 14
            }}>
              <div style={{ fontSize: 40, marginBottom: '12px' }}>📋</div>
              No complaints logged yet. Use the Log Complaint tab to add one!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Customer', 'Product', 'Batch', 'Category', 'Risk', 'Status', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid #e2e8f0'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((c, i) => (
                  <tr 
                    key={c.id} 
                    onClick={() => dispatch(setCurrentComplaint(c))}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: current?.id === c.id ? '#f0fdf4' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (current?.id !== c.id) {
                        e.currentTarget.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={e => {
                      if (current?.id !== c.id) {
                        e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'
                      }
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>#{c.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{c.customer_name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{c.product_name}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{c.batch_number}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{c.category || 'General'}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge label={c.risk_level || 'Unclassified'} /></td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge label={c.status || 'Open'} /></td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Drawer / Details Modal */}
      {current && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => dispatch(setCurrentComplaint(null))}>
          <div style={{
            width: '100%',
            maxWidth: '650px',
            height: '100vh',
            background: '#ffffff',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideIn 0.25s ease-out'
          }} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>COMPLAINT #{current.id}</span>
                  <StatusBadge label={current.status || 'Open'} />
                  <StatusBadge label={current.risk_level || 'Unclassified'} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                  {current.product_name} - Batch {current.batch_number}
                </h3>
              </div>
              <button 
                onClick={() => dispatch(setCurrentComplaint(null))}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* AI Duplicate Warning Banner */}
              {current.duplicate_flag && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'start',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: 16 }}>🚨</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>Potential Duplicate Detected</div>
                    <div style={{ fontSize: 12, marginTop: '2px', color: '#b91c1c' }}>
                      This complaint has been flagged by AI as a potential duplicate of an existing ticket in the QMS database.
                    </div>
                  </div>
                </div>
              )}

              {/* AI Completeness Banner */}
              {current.is_complete !== undefined && (
                <div style={{
                  background: current.is_complete ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${current.is_complete ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: current.is_complete ? '#16a34a' : '#d97706',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'start',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: 16 }}>{current.is_complete ? '✅' : '⚠️'}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {current.is_complete ? 'Completeness Check Passed' : 'Incomplete Intake Form'}
                    </div>
                    {!current.is_complete && current.missing_fields && (
                      <div style={{ fontSize: 12, marginTop: '4px', color: '#b45309' }}>
                        <strong>Missing Fields:</strong> {current.missing_fields}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary Section */}
              {current.ai_summary && (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #faf5ff)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✨</span> AI EXECUTIVE SUMMARY
                  </div>
                  <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{current.ai_summary}"
                  </p>
                </div>
              )}

              {/* Complaint Description */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Original Customer Description
                </div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: 13,
                  color: '#334155',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {current.description}
                </div>
              </div>

              {/* AI CAPA Recommendations */}
              {current.capa && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    🤖 AI Copilot Risk Assessment & CAPA Recommendations
                  </div>
                  <div style={{
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: 13,
                    color: '#4718a1',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {current.capa}
                  </div>
                </div>
              )}

              {/* Metadata Details */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Intake Metadata
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Customer Name</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{current.customer_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Customer Email</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{current.customer_email || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Product Category</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{current.category || 'General'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Log Date</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>
                      {new Date(current.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer controls */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Status workflow dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Workflow Status:</span>
                <select
                  value={current.status || 'Open'}
                  onChange={e => handleStatusChange(current.id, e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#334155',
                    outline: 'none',
                    background: '#fff'
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleDelete(current.id)}
                  style={{
                    padding: '8px 14px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Injecting CSS Animations in style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}