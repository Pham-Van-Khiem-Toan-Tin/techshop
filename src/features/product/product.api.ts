import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/baseQuery";
import type { ApiResponse } from "../../types/api.type";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    createProduct: builder.mutation<ApiResponse, FormData>({
      query: (body) => ({
        url: "/api/admin/catalog/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export const { useCreateProductMutation } = productApi;
