import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { Task } from "@/types";

interface TasksState {
  items: Task[];
  current: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk("tasks/fetch", async () => {
  const { data } = await api.get("/api/tasks");
  return data.tasks as Task[];
});

export const fetchTaskById = createAsyncThunk("tasks/fetchOne", async (id: string) => {
  const { data } = await api.get(`/api/tasks/${id}`);
  return data.task as Task;
});

export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    assigned_to: string;
  }) => {
    const { data } = await api.post("/api/tasks", payload);
    return data.task as Task;
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, ...payload }: { id: string; title?: string; description?: string; priority?: string; due_date?: string; assigned_to?: string }) => {
    const { data } = await api.put(`/api/tasks/${id}`, payload);
    return data.task as Task;
  }
);

export const completeTask = createAsyncThunk("tasks/complete", async (id: string) => {
  const { data } = await api.patch(`/api/tasks/${id}/complete`);
  return data.task as Task;
});

export const deleteTask = createAsyncThunk("tasks/delete", async (id: string) => {
  await api.delete(`/api/tasks/${id}`);
  return id;
});

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchTaskById.fulfilled, (s, a) => {
        s.current = a.payload;
      })
      .addCase(createTask.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateTask.fulfilled, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(completeTask.fulfilled, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t.id !== a.payload);
        if (s.current?.id === a.payload) s.current = null;
      });
  },
});

export const { clearCurrent } = tasksSlice.actions;

