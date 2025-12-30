import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import { rolesApi } from "../features/roles/role.api";
import { functionApi } from "../features/functions/function.api";
import { subFunctionApi } from "../features/subfunction/subfunction.api";
import { categoryApi } from "../features/category/category.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [functionApi.reducerPath]: functionApi.reducer,
    [subFunctionApi.reducerPath]: subFunctionApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer
  },
  middleware: (gDf) =>
    gDf().concat(
      rolesApi.middleware,
      functionApi.middleware,
      subFunctionApi.middleware,
      categoryApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
