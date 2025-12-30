import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Select, { components } from "react-select";
import { Controller, useForm } from "react-hook-form";

import { optionIcons } from "../../features/data/icon.data";
import type { IconOption } from "../../features/data/icon.data";
import { Control, SingleValue } from "../../configs/select.config";
import { selectStyles } from "../../features/data/select.data";

import type { CategoryDetail, CategoryOption } from "../../types/category.type";
import {
    useGetCategoryByIdQuery,
    useGetCategoryOptionQuery,
} from "../../features/category/category.api";



type ParentSelectOption = {
    value: string;
    label: string;
};

const CategoryDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { control, reset } = useForm<CategoryDetail>({
        defaultValues: {
            id: "",
            name: "",
            parentName: "",
            isVisible: true,
            sortOrder: 0,
            menuLabel: "",
            iconUrl: "",
            isFeatured: false,
            imageUrl: ""
        },
    });


    // ===== Load detail =====
    const {
        data: detail,
        isLoading: isDetailLoading,
        isFetching: isDetailFetching,
    } = useGetCategoryByIdQuery(id as string, { skip: !id });

    // ===== Parent options =====
    const {
        data: parentData,
        isLoading: isParentLoading,
        isFetching: isParentFetching,
    } = useGetCategoryOptionQuery(null);

    const parentOptions = useMemo<ParentSelectOption[]>(() => {
        const arr = (parentData ?? []) as CategoryOption[];
        return arr.map((x) => ({
            value: x.id,
            label: `${x.name} (Lv ${x.level})`,
        }));
    }, [parentData]);

    const BOOL_OPTIONS = useMemo(
        () => [
            { value: true, label: "Có" },
            { value: false, label: "Không" },
        ],
        []
    );

    const IconOptionRender = (props: any) => {
        const data = props.data as IconOption;
        const IconComp = data?.Icon;

        return (
            <components.Option {...props}>
                <div className="d-flex align-items-center gap-2">
                    {IconComp ? <IconComp size={16} /> : <span style={{ width: 16 }} />}
                    <span>{data?.label ?? ""}</span>
                </div>
            </components.Option>
        );
    };

    const isLoading = isDetailLoading || isDetailFetching;

    // ===== Populate data =====
    useEffect(() => {
        if (!detail) return;

        reset({
            name: detail?.name ?? "",
            parentName: detail?.parentName ?? "",
            isVisible: Boolean(detail?.isVisible),
            sortOrder: Number(detail?.sortOrder ?? 0),
            menuLabel: detail?.menuLabel ?? "",
            iconUrl: detail?.iconUrl ?? "",
            isFeatured: Boolean(detail?.isFeatured),
            imageUrl: detail?.imageUrl ?? "",
            id: detail?.id ?? "",
            slug: detail?.slug ?? ""
        });


    }, [detail, reset]);

    return (
        <div className="border-app--rounded bg-white m-4 py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between border-bottom px-4 pb-4">
                <div>
                    <div className="fw-bold fs-6">Chi tiết danh mục</div>
                    <div className="f-caption">Thông tin danh mục (chỉ xem).</div>
                </div>

                <button
                    className="btn-app btn-app--ghost btn-app--sm"
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </button>
            </div>

            <div className="form-app px-4 pt-4 form-app">
                {/* 🔒 Read-only */}
                <fieldset disabled>
                    <div className="row gx-5 gy-4">
                        {/* name */}
                        <div className="col-12 col-md-6" hidden>
                            <label className="form-label">ID:</label>
                            <input className="form-control form-control-sm" {...control.register?.("id")} />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Tên danh mục</label>
                            <input className="form-control form-control-sm" {...control.register?.("name")} />
                        </div>

                        {/* menuLabel */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Nhãn menu:</label>
                            <input className="form-control form-control-sm" {...control.register?.("menuLabel")} />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Slug:</label>
                            <input className="form-control form-control-sm" {...control.register?.("slug")} />
                        </div>
                        {/* parentId */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Danh mục cha:</label>
                            <input className="form-control form-control-sm" {...control.register?.("parentName")} />
                        </div>

                        {/* sortOrder */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Thứ tự sắp xếp</label>
                            <Controller
                                name="sortOrder"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        className="form-control form-control-sm"
                                        value={String(field.value ?? "")}
                                        readOnly
                                    />
                                )}
                            />
                        </div>

                        {/* iconUrl */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Biểu tượng</label>
                            <Controller
                                name="iconUrl"
                                control={control}
                                render={({ field }) => (
                                    <Select<IconOption, false>
                                        value={optionIcons.find((o) => o.value === field.value) ?? null}
                                        options={optionIcons}
                                        isDisabled
                                        components={{
                                            Option: IconOptionRender,
                                            SingleValue,
                                            Control,
                                            DropdownIndicator: null,
                                            IndicatorSeparator: null,
                                        }}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                        </div>

                        {/* isVisible */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Hiển thị</label>
                            <Controller
                                name="isVisible"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={BOOL_OPTIONS}
                                        value={BOOL_OPTIONS.find((x) => x.value === field.value) ?? null}
                                        isDisabled
                                        isSearchable={false}
                                        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                        </div>

                        {/* isFeatured */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Nổi bật</label>
                            <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={BOOL_OPTIONS}
                                        value={BOOL_OPTIONS.find((x) => x.value === field.value) ?? null}
                                        isDisabled
                                        isSearchable={false}
                                        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                        </div>

                        {/* image */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Ảnh danh mục</label>

                            {detail?.imageUrl ? (
                                <img
                                    src={detail?.imageUrl}
                                    alt="category"
                                    style={{
                                        width: 140,
                                        height: 140,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        border: "1px solid var(--app-border)",
                                    }}
                                />
                            ) : (
                                <div className="f-caption text-muted">Không có ảnh</div>
                            )}
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    );
};

export default CategoryDetail;
