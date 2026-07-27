import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { submitComplaint } from '../store/complaintSlice'
import StatusBadge from './StatusBadge'

const Field = ({ label, value, onChange, type = 'text', required, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>
      {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Awaiting AI extraction...'}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: 13,
        color: '#1e293b',
        outline: 'none',
        transition: 'border 0.2s',
        background: value ? '#fff' : '#f8fafc'
      }}
      onFocus={e => e.target.style.borderColor = '#2563eb'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
    />
  </div>
)

const Section = ({ number, title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      color: '#94a3b8',
      letterSpacing: '0.08em',
      marginBottom: '12px',
      textTransform: 'uppercase'
    }}>
      {number}. {title}
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }}>
      {children}
    </div>
  </div>
)

export default function ComplaintForm({ extractedData }) {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.complaints)

  const [form, setForm] = useState({
    complaint_source  : '',
    customer_name     : '',
    product_name      : '',
    product_strength  : '',
    batch_number      : '',
    manufacturing_date: '',
    expiry_date       : '',
    quantity_affected : '',
    complaint_type    : '',
    complaint_date    : '',
    description       : '',
    severity          : '',
    priority          : '',
  })

  const set = (field) => (value) => setForm(f => ({ ...f, [field]: value }))

  // Auto-fill form when AI extracts data
  useEffect(() => {
    if (extractedData) {
      setForm(f => ({
        ...f,
        customer_name   : extractedData.customer_name    || f.customer_name,
        product_name    : extractedData.product_name     || f.product_name,
        batch_number    : extractedData.batch_number     || f.batch_number,
        complaint_type  : extractedData.category         || f.complaint_type,
        description     : extractedData.complaint_text   || f.description,
        severity        : extractedData.risk_level       || f.severity,
        priority        : extractedData.priority         || f.priority,
        complaint_source: extractedData.complaint_source || f.complaint_source,
        product_strength: extractedData.product_strength || f.product_strength,
        quantity_affected: extractedData.quantity_affected || f.quantity_affected,
        complaint_date  : extractedData.complaint_date   || f.complaint_date,
        manufacturing_date: extractedData.manufacturing_date || f.manufacturing_date,
        expiry_date     : extractedData.expiry_date       || f.expiry_date,
      }))
    }
  }, [extractedData])

  const handleSubmit = async () => {
    const payload = {
      title          : `Complaint - ${form.product_name} - ${form.batch_number}`,
      description    : form.description,
      product_name   : form.product_name,
      batch_number   : form.batch_number,
      customer_name  : form.customer_name,
      customer_email : '',
      complaint_type : form.complaint_type,
      severity       : form.severity,
    }
    await dispatch(submitComplaint(payload))
    alert('✅ Complaint submitted successfully!')
    setForm({
      complaint_source: '', customer_name: '',
      product_name: '', product_strength: '',
      batch_number: '', manufacturing_date: '',
      expiry_date: '', quantity_affected: '',
      complaint_type: '', complaint_date: '',
      description: '', severity: '', priority: '',
    })
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {/* Form Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
            Log Customer Complaint
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            API & FDF Quality Assurance Module
          </p>
        </div>
        <StatusBadge label="Pending Triage" />
      </div>

      {/* Form Body */}
      <div style={{ padding: '24px' }}>

        {/* Section 1 */}
        <Section number="1" title="Origin & Customer Details">
          <Field label="Complaint Source" value={form.complaint_source} onChange={set('complaint_source')} />
          <Field label="Customer Name"    value={form.customer_name}    onChange={set('customer_name')} required />
        </Section>

        {/* Section 2 */}
        <Section number="2" title="Product & Batch Identification">
          <Field label="Product Name"        value={form.product_name}      onChange={set('product_name')} required />
          <Field label="Product Strength/Grade" value={form.product_strength} onChange={set('product_strength')} />
          <Field label="Batch/Lot Number"    value={form.batch_number}      onChange={set('batch_number')} required />
          <Field label="Manufacturing Date"  value={form.manufacturing_date} onChange={set('manufacturing_date')} type="date" />
          <Field label="Expiry Date"         value={form.expiry_date}       onChange={set('expiry_date')} type="date" />
          <Field label="Quantity Affected"   value={form.quantity_affected}  onChange={set('quantity_affected')} />
        </Section>

        {/* Section 3 */}
        <Section number="3" title="Complaint Details">
          <Field label="Complaint Type" value={form.complaint_type} onChange={set('complaint_type')} />
          <Field label="Complaint Date" value={form.complaint_date} onChange={set('complaint_date')} type="date" />
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>
              Detailed Complaint Description <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              placeholder="Awaiting AI extraction..."
              rows={4}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
        </Section>

        {/* Section 4 */}
        <Section number="4" title="Initial Assessment & Priority">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Initial Severity</label>
            <select
              value={form.severity}
              onChange={e => set('severity')(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc'
              }}
            >
              <option value="">Awaiting AI extraction...</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Priority</label>
            <select
              value={form.priority}
              onChange={e => set('priority')(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc'
              }}
            >
              <option value="">Awaiting AI extraction...</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </Section>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={() => setForm({
              complaint_source: '', customer_name: '',
              product_name: '', product_strength: '',
              batch_number: '', manufacturing_date: '',
              expiry_date: '', quantity_affected: '',
              complaint_type: '', complaint_date: '',
              description: '', severity: '', priority: '',
            })}
            style={{
              padding: '8px 20px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fff',
              fontSize: 13,
              color: '#64748b',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ↺ Reset Form
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: '8px',
              background: loading ? '#93c5fd' : '#2563eb',
              fontSize: 13,
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Complaint'}
          </button>
        </div>
      </div>
    </div>
  )
}