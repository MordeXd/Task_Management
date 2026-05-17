import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const loadStored = (): Partial<AuthState> => {
  try {
    const raw = localStorage.getItem("taskflow_auth");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const stored = loadStored();

const initialState: AuthState = {
  user: stored.user ?? null,
  accessToken: stored.accessToken ?? null,
  refreshToken: stored.refreshToken ?? null,
  loading: false,
  error: null,
};

const persist = (state: AuthState) => {
  localStorage.setItem(
    "taskflow_auth",
    JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    })
  );
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      return data as { access_token: string; refresh_token: string; user: User };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed";
      return rejectWithValue(msg);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem("taskflow_auth");
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        persist(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      });
  },
});

export const { logout, setTokens, setUser } = authSlice.actions;

