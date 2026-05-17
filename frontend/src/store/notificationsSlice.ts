import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import type { Notification } from "@/types";

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ limit, skip }: { limit?: number; skip?: number } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (skip) params.set("skip", String(skip));
    const { data } = await api.get(`/api/notifications?${params.toString()}`);
    return data.notifications as Notification[];
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async () => {
    const { data } = await api.get("/api/notifications/unread-count");
    return data.count as number;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`);
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async () => {
    await api.patch("/api/notifications/read-all");
    return true;
  }
);

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    prependNotification(state, action) {
      state.items.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (s, a) => {
        s.unreadCount = a.payload;
      })
      .addCase(markAsRead.fulfilled, (s, a) => {
        const n = s.items.find((n) => n.id === a.payload);
        if (n && !n.read) {
          n.read = true;
          s.unreadCount = Math.max(0, s.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (s) => {
        s.items.forEach((n) => (n.read = true));
        s.unreadCount = 0;
      });
  },
});

export const { setUnreadCount, prependNotification } = notificationsSlice.actions;
