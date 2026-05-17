import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: (localStorage.getItem("taskflow_theme") as "light" | "dark") || "light",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("taskflow_theme", state.theme);
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    },
  },
});

export const { setSidebarOpen, toggleTheme } = uiSlice.actions;

