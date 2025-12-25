import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/baseQuery";

import type { FunctionData, FunctionEntity, FunctionOption } from "../../types/function.type";
import type { Page } from "../../types/page.type";
export const functionApi = createApi({
  reducerPath: "functionApi",
  baseQuery,
  tagTypes: ["All_Function", "Function", "Function_Option"],
  endpoints: (builder) => ({
    getAllFunctions: builder.query<
      FunctionEntity[],
      null
    >({
      query: () => ({
        url: "/auth/functions/all",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({
                type: "All_Function" as const,
                id: p.id,
              })),
              { type: "All_Function" as const, id: "LIST" },
            ]
          : [{ type: "All_Function" as const, id: "LIST" }],
      keepUnusedDataFor: 30,
    }),
    getFunctions: builder.query<
      Page<FunctionData>,
      { keyword: string; page: number; size: number, fields: string[], sort: string }
    >({
      query: ({ keyword, page, size, fields, sort }) => ({
        url: "/auth/functions",
        params: { keyword, page, size, fields, sort }
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.content.map((p) => ({
                type: "Function" as const,
                id: p.id,
              })),
              { type: "Function" as const, id: "LIST" },
            ]
          : [{ type: "Function" as const, id: "LIST" }],
          keepUnusedDataFor: 30
    }),
    getFunctionOptions: builder.query<
    FunctionOption[],
    null
    >({
      query: () => ({
        url: "/auth/functions/options"
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({
                type: "Function_Option" as const,
                id: p.id,
              })),
              { type: "Function_Option" as const, id: "LIST" },
            ]
          : [{ type: "Function_Option" as const, id: "LIST" }],
        keepUnusedDataFor: 30,
    })
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export const { useGetAllFunctionsQuery, useGetFunctionsQuery, useGetFunctionOptionsQuery } = functionApi;