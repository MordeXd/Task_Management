import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { User } from "@/types";

interface UsersState {
  admins: User[];
  employees: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  admins: [],
  employees: [],
  loading: false,
  error: null,
};

export const fetchAdmins = createAsyncThunk("users/fetchAdmins", async () => {
  const { data } = await api.get("/api/company/admins");
  return data.admins as User[];
});

export const fetchEmployees = createAsyncThunk("users/fetchEmployees", async () => {
  const { data } = await api.get("/api/company/employees");
  return data.employees as User[];
});

export const createAdmin = createAsyncThunk(
  "users/createAdmin",
  async (payload: { name: string; email: string; password?: string; department?: string }) => {
    const { data } = await api.post("/api/company/admins", payload);
    return data as { user: User; temporary_password: string };
  }
);

export const createEmployee = createAsyncThunk(
  "users/createEmployee",
  async (payload: { name: string; email: string; password?: string; department?: string }) => {
    const { data } = await api.post("/api/company/employees", payload);
    return data as { user: User; temporary_password: string };
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, ...payload }: { id: string; name?: string; email?: string; department?: string }) => {
    const { data } = await api.put(`/api/company/users/${id}`, payload);
    return data.user as User;
  }
);

export const deactivateUser = createAsyncThunk("users/deactivate", async (id: string) => {
  await api.patch(`/api/company/users/${id}/deactivate`);
  return id;
});

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchAdmins.fulfilled, (s, a) => {
        s.loading = false;
        s.admins = a.payload;
      })
      .addCase(fetchEmployees.fulfilled, (s, a) => {
        s.loading = false;
        s.employees = a.payload;
      })
      .addCase(createAdmin.fulfilled, (s, a) => {
        s.admins.push(a.payload.user);
      })
      .addCase(createEmployee.fulfilled, (s, a) => {
        s.employees.push(a.payload.user);
      })
      .addCase(updateUser.fulfilled, (s, a) => {
        const update = (list: User[]) => {
          const i = list.findIndex((u) => u.id === a.payload.id);
          if (i >= 0) list[i] = a.payload;
        };
        update(s.admins);
        update(s.employees);
      })
      .addCase(deactivateUser.fulfilled, (s, a) => {
        s.admins = s.admins.filter((u) => u.id !== a.payload);
        s.employees = s.employees.filter((u) => u.id !== a.payload);
      });
  },
});

