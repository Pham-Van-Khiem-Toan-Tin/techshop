import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/baseQuery";
import type { Page } from "../../types/page.type";
import type { Brand, BrandDetail } from "../../types/brand.type";
import type { ApiResponse } from "../../types/api.type";

export const brandApi = createApi({
  reducerPath: "brandApi",
  baseQuery,
  tagTypes: ["Brands", "Brand"],
  endpoints: (builder) => ({
    getAllBrands: builder.query<
      Page<Brand>,
      {
        keyword: string;
        page: number;
        size: number;
        fields: string[];
        sort: string;
      }
    >({
      query: ({ keyword, page, size, fields, sort }) => ({
        url: "/api/admin/catalog/brands",
        params: { keyword, page, size, fields, sort },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((p) => ({
                type: "Brands" as const,
                id: p.id,
              })),
              { type: "Brands" as const, id: "LIST" },
            ]
          : [{ type: "Brands" as const, id: "LIST" }],
      keepUnusedDataFor: 30,
    }),
    getBrandById: builder.query<BrandDetail, string>({
      query: (id) => ({
        url: `/api/admin/catalog/brands/${id}`
      }),
      providesTags: (result, error, id) => [{ type: "Brand", id }],
      keepUnusedDataFor: 0,
    }),
    createBrand: builder.mutation<ApiResponse, FormData>({
      query: (body) => ({
        url: "/api/admin/catalog/brands",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),
    deleteBrand: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/api/admin/catalog/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Brands", id },
        { type: "Brands", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandByIdQuery
} = brandApi;
