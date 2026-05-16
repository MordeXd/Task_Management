import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Admin, AdminState, CreateAdminData } from '../types/rootTypes'
import api from '../services/api'

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
  successMessage: null,
}

interface CreateAdminResponse {
  message: string
  admin: Admin & { temp_password?: string }
}

interface UpdateUserData {
  email?: string
  name?: string
  password?: string
}

interface UpdateUserResponse {
  message: string
  user: Admin
}

export const fetchAdmins = createAsyncThunk<Admin[], void, { rejectValue: string }>(
  'admin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ admins: Admin[] }>('/api/company/admins')
      return response.data.admins
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admins')
    }
  }
)

export const createAdmin = createAsyncThunk<CreateAdminResponse, CreateAdminData, { rejectValue: string }>(
  'admin/createAdmin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateAdminResponse>('/api/company/admins', data)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to create admin')
    }
  }
)

export const updateAdmin = createAsyncThunk<UpdateUserResponse, { userId: string; data: UpdateUserData }, { rejectValue: string }>(
  'admin/updateAdmin',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<UpdateUserResponse>(`/api/company/users/${userId}`, data)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to update admin')
    }
  }
)

export const deactivateAdmin = createAsyncThunk<UpdateUserResponse, string, { rejectValue: string }>(
  'admin/deactivateAdmin',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch<UpdateUserResponse>(`/api/company/users/${userId}/deactivate`)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate admin')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admins
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdmins.fulfilled, (state, action: PayloadAction<Admin[]>) => {
        state.loading = false
        state.admins = action.payload
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create admin
      .addCase(createAdmin.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admins.push(action.payload.admin)
        state.successMessage = `Admin created! Temporary password: ${action.payload.admin.temp_password}`
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false
        const index = state.admins.findIndex(a => a._id === action.payload.user._id)
        if (index !== -1) {
          state.admins[index] = action.payload.user
        }
        state.successMessage = 'Admin updated successfully'
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Deactivate admin
      .addCase(deactivateAdmin.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(deactivateAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admins = state.admins.filter(a => a._id !== action.payload.user._id)
        state.successMessage = 'Admin deactivated successfully'
      })
      .addCase(deactivateAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearAdminMessages } = adminSlice.actions
export default adminSlice.reducer