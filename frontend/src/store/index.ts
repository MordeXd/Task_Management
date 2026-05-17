import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { groupTasksSlice } from "./groupTasksSlice";
import { notificationsSlice } from "./notificationsSlice";
import { tasksSlice } from "./tasksSlice";
import { uiSlice } from "./uiSlice";
import { usersSlice } from "./usersSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    users: usersSlice.reducer,
    tasks: tasksSlice.reducer,
    ui: uiSlice.reducer,
    notifications: notificationsSlice.reducer,
    groupTasks: groupTasksSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

