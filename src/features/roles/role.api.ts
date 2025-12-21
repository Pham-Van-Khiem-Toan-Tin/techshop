// src/features/roles/rolesApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import {baseQuery} from "../../lib/baseQuery";
import type { Role } from "../../types/role.type";
import type {Page} from "../../types/page.type"
export const rolesApi = createApi({
  reducerPath: "roleApi",
  baseQuery,
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getRoles: builder.query<Page<Role>, {keyword: string; page: number; size: number}>({
      query: ({keyword, page, size}) => ({
        url: "/auth/roles",
        params: {keyword, page, size}
      }),
      providesTags: (result) => 
        result
          ? [
            ...result.content.map((p) => ({type: "Role" as const, id: p.id})),
            {type: "Role" as const, id: "LIST"},
          ]
          : [{type: "Role" as const, id: "LIST"}],
      keepUnusedDataFor: 30
    })
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
})

export const {useGetRolesQuery} = rolesApi;
