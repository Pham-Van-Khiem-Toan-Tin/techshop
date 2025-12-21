import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import { rolesApi } from "../features/roles/role.api";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rolesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
