import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

// Submit complaint
export const submitComplaint = createAsyncThunk(
  'complaints/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/complaints/', formData)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Fetch all complaints
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async () => {
    const response = await api.get('/complaints/')
    return response.data
  }
)

// Extract from file using AI
export const extractFromFile = createAsyncThunk(
  'complaints/extract',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/complaints/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Update complaint status
export const updateComplaintStatus = createAsyncThunk(
  'complaints/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/complaints/${id}/status?status=${status}`)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Delete complaint
export const deleteComplaint = createAsyncThunk(
  'complaints/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/complaints/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    list          : [],
    current       : null,
    loading       : false,
    extracting    : false,
    extractProgress: 0,
    error         : null,
    aiMessages    : [],
    extractedData : null,
  },
  reducers: {
    setExtractProgress: (state, action) => {
      state.extractProgress = action.payload
    },
    addAiMessage: (state, action) => {
      state.aiMessages.push(action.payload)
    },
    clearExtracted: (state) => {
      state.extractedData = null
      state.extractProgress = 0
    },
    setCurrentComplaint: (state, action) => {
      state.current = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit
      .addCase(submitComplaint.pending,   (state) => { state.loading = true })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload)
      })
      .addCase(submitComplaint.rejected,  (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch all
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.list = action.payload
      })
      // Extract
      .addCase(extractFromFile.pending,   (state) => { state.extracting = true; state.extractProgress = 10 })
      .addCase(extractFromFile.fulfilled, (state, action) => {
        state.extracting = false
        state.extractProgress = 100
        state.extractedData = action.payload
      })
      .addCase(extractFromFile.rejected,  (state) => {
        state.extracting = false
        state.extractProgress = 0
      })
      // Update Status
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c.id === action.payload.id)
        if (idx !== -1) {
          state.list[idx] = action.payload
        }
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload
        }
      })
      // Delete
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.id !== action.payload)
        if (state.current && state.current.id === action.payload) {
          state.current = null
        }
      })
  }
})

export const { setExtractProgress, addAiMessage, clearExtracted, setCurrentComplaint } = complaintSlice.actions
export default complaintSlice.reducer