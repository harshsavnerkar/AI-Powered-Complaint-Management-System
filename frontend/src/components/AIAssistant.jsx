import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { extractFromFile, addAiMessage } from '../store/complaintSlice'
import api from '../services/api'

export default function AIAssistant({ onExtracted }) {
  const dispatch    = useDispatch()
  const { extracting, extractProgress, aiMessages } = useSelector(s => s.complaints)
  const [pasteText, setPasteText]   = useState('')
  const [showPaste, setShowPaste]   = useState(false)
  const [dragging, setDragging]     = useState(false)
  const [chatInput, setChatInput]   = useState('')
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    dispatch(addAiMessage({ role: 'ai', text: `Analyzing ${file.name}...` }))
    const result = await dispatch(extractFromFile(file))
    if (extractFromFile.fulfilled.match(result)) {
      onExtracted(result.payload)
      dispatch(addAiMessage({
        role: 'ai',
        text: `✅ Extracted successfully! Form has been populated. Risk: ${result.payload.risk_level || 'Analyzing...'}`
      }))
    } else {
      dispatch(addAiMessage({
        role: 'ai',
        text: `❌ Error extracting from ${file.name}. Please ensure the file is valid and readable.`
      }))
    }
  }

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return
    dispatch(addAiMessage({ role: 'user', text: pasteText }))
    dispatch(addAiMessage({ role: 'ai', text: 'Analyzing complaint text...' }))
    try {
      const res = await api.post('/complaints/extract-text', { text: pasteText })
      onExtracted(res.data)
      dispatch(addAiMessage({
        role: 'ai',
        text: `✅ Done! Form populated. Risk Level: ${res.data.risk_level}`
      }))
      setPasteText('')
      setShowPaste(false)
    } catch {
      dispatch(addAiMessage({ role: 'ai', text: '❌ Error extracting. Please try again.' }))
    }
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput
    setChatInput('')
    dispatch(addAiMessage({ role: 'user', text: msg }))
    try {
      const res = await api.post('/complaints/chat', { message: msg })
      dispatch(addAiMessage({ role: 'ai', text: res.data.reply }))
    } catch {
      dispatch(addAiMessage({ role: 'ai', text: 'Sorry, I could not process that.' }))
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14
        }}>✨</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
            AI Complaint Intake Assistant
          </div>
        </div>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10, fontWeight: 700,
          background: '#eff6ff', color: '#2563eb',
          padding: '2px 6px', borderRadius: '4px'
        }}>BETA</span>
      </div>

      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? '#2563eb' : '#cbd5e1'}`,
            borderRadius: '10px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#eff6ff' : '#f8fafc',
            transition: 'all 0.2s',
            marginBottom: '12px'
          }}
        >
          <div style={{ fontSize: 28, marginBottom: '8px' }}>☁️</div>
          <div style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
            Drag & drop complaint document here
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>or</div>
          <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>
            click to browse
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,.docx,.txt,.eml"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>

        {/* Supported formats */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: 12,
          color: '#16a34a',
          marginBottom: '12px'
        }}>
          ✅ Supported formats: PDF, DOCX, TXT, EML — Max file size: 10MB
        </div>

        {/* OR divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '12px 0', color: '#94a3b8', fontSize: 13
        }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          OR
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Paste Text Button */}
        <button
          onClick={() => setShowPaste(!showPaste)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: '#fff',
            fontSize: 13,
            color: '#475569',
            fontWeight: 500,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📋 Paste Complaint Text / Email
        </button>

        {/* Paste Text Area */}
        {showPaste && (
          <div style={{ marginBottom: '12px' }}>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste complaint email or text here..."
              style={{
                width: '100%',
                height: '100px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                resize: 'none',
                outline: 'none'
              }}
            />
            <button
              onClick={handlePasteSubmit}
              style={{
                width: '100%',
                padding: '8px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: 13,
                fontWeight: 600,
                marginTop: '6px'
              }}
            >
              Extract with AI
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {extracting && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '6px'
            }}>
              <div style={{
                height: '100%',
                width: `${extractProgress}%`,
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                borderRadius: '3px',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Analyzing document and extracting key details...
            </div>
          </div>
        )}

        {/* AI Messages */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            AI ASSISTANT
          </div>
          <div style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '10px',
            minHeight: '80px',
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {aiMessages.length === 0 ? (
              <div style={{
                fontSize: 13,
                color: '#64748b',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <span>🤖</span>
                <span>
                  Upload a complaint document or paste text above.
                  I will automatically extract the details and populate the form for you.
                </span>
              </div>
            ) : (
              aiMessages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '6px',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.role === 'ai' && <span>🤖</span>}
                  <div style={{
                    background: msg.role === 'user' ? '#eff6ff' : '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: 12,
                    color: '#334155',
                    maxWidth: '85%'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleChat()}
          placeholder="Ask me anything about this complaint..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: 13,
            outline: 'none'
          }}
        />
        <button
          onClick={handleChat}
          style={{
            width: 36, height: 36,
            background: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >➤</button>
      </div>
      <div style={{ padding: '6px 16px 10px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        AI responses may contain errors. Please verify information.
      </div>
    </div>
  )
}