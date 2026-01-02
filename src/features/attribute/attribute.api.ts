import { createApi } from "@reduxjs/toolkit/query/react";
import type { Page } from "../../types/page.type";
import {
  type AttributeCreateForm,
  type Attribute,
  type AttributeDetail,
  type AttributeEditForm,
} from "../../types/attribute.type";
import { baseQuery } from "../../lib/baseQuery";
import type { ApiResponse } from "../../types/api.type";

export const attributeApi = createApi({
  reducerPath: "attributeApi",
  baseQuery,
  tagTypes: ["Attributes", "Attribute"],
  endpoints: (builder) => ({
    getAttributes: builder.query<
      Page<Attribute>,
      {
        keyword: string;
        page: number;
        size: number;
        fields: string[];
        sort: string;
      }
    >({
      query: ({ keyword, page, size, fields, sort }) => ({
        url: "/api/admin/catalog/attributes",
        params: { keyword, page, size, fields, sort },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((p) => ({
                type: "Attributes" as const,
                id: p.id,
              })),
              { type: "Attributes" as const, id: "LIST" },
            ]
          : [{ type: "Attributes" as const, id: "LIST" }],
      keepUnusedDataFor: 30,
    }),
    getAttributeById: builder.query<AttributeDetail, string>({
      query: (id) => ({
        url: `/api/admin/catalog/attributes/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Attribute", id }],
      keepUnusedDataFor: 0,
    }),
    createAttribute: builder.mutation<ApiResponse, AttributeCreateForm>({
      query: (body) => ({
        url: `/api/admin/catalog/attributes`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),
    editAttribute: builder.mutation<ApiResponse, {id: string, body: AttributeEditForm}>({
      query: ({id, body}) => ({
        url: `/api/admin/catalog/attributes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),
    deleteAttribute: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/api/admin/catalog/attributes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Attributes", id },
        { type: "Attributes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useEditAttributeMutation,
  useCreateAttributeMutation,
  useDeleteAttributeMutation,
  useGetAttributeByIdQuery,
} = attributeApi;
