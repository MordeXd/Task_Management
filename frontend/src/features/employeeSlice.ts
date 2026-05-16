import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Employee, EmployeeState, CreateEmployeeData } from '../types/rootTypes'
import api from '../services/api'

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
  successMessage: null,
}

interface CreateEmployeeResponse {
  message: string
  employee: Employee & { temp_password?: string }
}

interface UpdateUserData {
  email?: string
  name?: string
  password?: string
}

interface UpdateUserResponse {
  message: string
  user: Employee
}

export const fetchEmployees = createAsyncThunk<Employee[], void, { rejectValue: string }>(
  'employee/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ employees: Employee[] }>('/api/company/employees')
      return response.data.employees
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees')
    }
  }
)

export const createEmployee = createAsyncThunk<CreateEmployeeResponse, CreateEmployeeData, { rejectValue: string }>(
  'employee/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateEmployeeResponse>('/api/company/employees', data)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee')
    }
  }
)

export const updateEmployee = createAsyncThunk<UpdateUserResponse, { userId: string; data: UpdateUserData }, { rejectValue: string }>(
  'employee/updateEmployee',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<UpdateUserResponse>(`/api/company/users/${userId}`, data)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee')
    }
  }
)

export const deactivateEmployee = createAsyncThunk<UpdateUserResponse, string, { rejectValue: string }>(
  'employee/deactivateEmployee',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch<UpdateUserResponse>(`/api/company/users/${userId}/deactivate`)
      return response.data
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to deactivate employee')
    }
  }
)

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false
        state.employees = action.payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees.push(action.payload.employee)
        state.successMessage = `Employee created! Temporary password: ${action.payload.employee.temp_password}`
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false
        const index = state.employees.findIndex(e => e._id === action.payload.user._id)
        if (index !== -1) {
          state.employees[index] = action.payload.user
        }
        state.successMessage = 'Employee updated successfully'
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Deactivate employee
      .addCase(deactivateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(deactivateEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.filter(e => e._id !== action.payload.user._id)
        state.successMessage = 'Employee deactivated successfully'
      })
      .addCase(deactivateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearEmployeeMessages } = employeeSlice.actions
export default employeeSlice.reducer