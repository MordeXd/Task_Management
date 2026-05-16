import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../types/rootTypes'

/**
 * Typed version of useDispatch for Redux
 * Use this instead of plain `useDispatch` from react-redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Typed version of useSelector for Redux
 * Use this instead of plain `useSelector` from react-redux
 * Example: const user = useAppSelector((state) => state.auth.user)
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector