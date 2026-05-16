import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import api from '../services/api'

interface User {
  id: string
  email: string
  role: string
  company_id: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', credentials)
      const { access_token, refresh_token, user } = response.data

      // Store in localStorage
      localStorage.setItem('token', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))

      return { user, access_token, refresh_token }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.error = null
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer