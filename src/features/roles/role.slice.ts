// src/features/roles/rolesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { rolesApi } from "./role.api";
import type { Role } from "../../types/role.type";

type RolesState = {
  items: Role[];
  loading: boolean;
  error?: string;
};

const initialState: RolesState = {
  items: [],
  loading: false,
};

export const fetchRoles = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>("roles/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    return await rolesApi.getAll();
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Fetch roles failed");
  }
});

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export default rolesSlice.reducer;
