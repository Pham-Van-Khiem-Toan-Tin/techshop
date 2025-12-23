import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/baseQuery";
import type { Page } from "../../types/page.type";
import type { SubFunction } from "../../types/function.type";

export const subFunctionApi = createApi({
  reducerPath: "subfunctionApi",
  baseQuery,
  tagTypes: ["SubFunction"],
  endpoints: (builder) => ({
    getSubFunctions: builder.query<
      Page<SubFunction>,
      { keyword: string; page: number; size: number, fields: string[], sort: string }
    >({
      query: ({ keyword, page, size, fields, sort }) => ({
        url: "/auth/subfunctions",
        params: { keyword, page, size, fields, sort },
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.content.map((p) => ({
                type: "SubFunction" as const,
                id: p.id,
              })),
              { type: "SubFunction" as const, id: "LIST" },
            ]
          : [{ type: "SubFunction" as const, id: "LIST" }],
          keepUnusedDataFor: 30
    }),
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

export const { useGetSubFunctionsQuery } = subFunctionApi
