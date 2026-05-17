import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { GroupTask } from "@/types";

interface GroupTasksState {
  items: GroupTask[];
  current: GroupTask | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupTasksState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchGroupTasks = createAsyncThunk("groupTasks/fetch", async () => {
  const { data } = await api.get("/api/group-tasks");
  return data.tasks as GroupTask[];
});

export const fetchGroupTaskById = createAsyncThunk("groupTasks/fetchOne", async (id: string) => {
  const { data } = await api.get(`/api/group-tasks/${id}`);
  return data.task as GroupTask;
});

export const createGroupTask = createAsyncThunk(
  "groupTasks/create",
  async (payload: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    assigned_to: string[];
    links?: { url: string; title?: string }[];
  }) => {
    const { data } = await api.post("/api/group-tasks", payload);
    return data.task as GroupTask;
  }
);

export const updateGroupTask = createAsyncThunk(
  "groupTasks/update",
  async ({ id, ...payload }: { id: string; title?: string; description?: string; priority?: string; due_date?: string; assigned_to?: string[]; links?: { url: string; title?: string }[] }) => {
    const { data } = await api.put(`/api/group-tasks/${id}`, payload);
    return data.task as GroupTask;
  }
);

export const completeGroupTask = createAsyncThunk("groupTasks/complete", async (id: string) => {
  const { data } = await api.patch(`/api/group-tasks/${id}/complete`);
  return data.task as GroupTask;
});

export const deleteGroupTask = createAsyncThunk("groupTasks/delete", async (id: string) => {
  await api.delete(`/api/group-tasks/${id}`);
  return id;
});

export const groupTasksSlice = createSlice({
  name: "groupTasks",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupTasks.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchGroupTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchGroupTaskById.fulfilled, (s, a) => {
        s.current = a.payload;
      })
      .addCase(createGroupTask.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateGroupTask.fulfilled, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(completeGroupTask.fulfilled, (s, a) => {
        const i = s.items.findIndex((t) => t.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(deleteGroupTask.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t.id !== a.payload);
        if (s.current?.id === a.payload) s.current = null;
      });
  },
});

export const { clearCurrent } = groupTasksSlice.actions;
