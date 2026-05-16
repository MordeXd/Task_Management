import { configureStore } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from '../types/rootTypes'
import authReducer from '../features/authSlice'
import adminReducer from '../features/adminSlice'
import employeeReducer from '../features/employeeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    employee: employeeReducer,
  },
})

export type { RootState, AppDispatch }