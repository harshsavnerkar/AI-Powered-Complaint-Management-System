import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './styles/global.css'
import Header from './components/Header'
import ComplaintForm from './components/ComplaintForm'
import AIAssistant from './components/AIAssistant'
import Dashboard from './components/Dashboard'

function App() {
  const [page, setPage]             = useState('Log Complaint')
  const [extractedData, setExtracted] = useState(null)

  return (
    <Provider store={store}>
      <div style={{ minHeight: '100vh', background: '#f4f6f9' }}>
        <Header page={page} setPage={setPage} />
        <main style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          {page === 'Log Complaint' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 420px',
              gap: '24px',
              alignItems: 'start'
            }}>
              <ComplaintForm extractedData={extractedData} />
              <div style={{ position: 'sticky', top: '80px' }}>
                <AIAssistant onExtracted={setExtracted} />
              </div>
            </div>
          ) : (
            <Dashboard />
          )}
        </main>
      </div>
    </Provider>
  )
}

export default App