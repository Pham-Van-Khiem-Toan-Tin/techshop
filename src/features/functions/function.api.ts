import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/baseQuery";

import type { FunctionEntity } from "../../types/function.type";
export const functionApi = createApi({
  reducerPath: "functionApi",
  baseQuery,
  tagTypes: ["All_Function"],
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
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export const { useGetAllFunctionsQuery } = functionApi;