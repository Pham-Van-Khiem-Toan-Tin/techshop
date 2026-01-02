import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Select, { components } from "react-select";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { RiSaveLine } from "react-icons/ri";

import { optionIcons } from "../../features/data/icon.data";
import type { IconOption } from "../../features/data/icon.data";
import { Control, SingleValue } from "../../configs/select.config";
import { selectStyles } from "../../features/data/select.data";

import type { CategoryOption, CategoryUpdateForm } from "../../types/category.type";
import {
    useGetCategoryOptionQuery,
    useGetCategoryByIdQuery,
    useUpdateCategoryMutation,
} from "../../features/category/category.api";

type ParentSelectOption = {
    value: string;
    label: string;
};

const CategoryEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<CategoryUpdateForm>({
        defaultValues: {
            id: "",
            name: "",
            parentId: "",
            isVisible: true,
            sortOrder: 10,
            menuLabel: "",
            iconUrl: "",
            imageFile: null,
            isFeatured: false,
        },
    });

    const [imagePreview, setImagePreview] = useState<string>("");

    // ✅ fetch parent options
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

    // ✅ react-select option render for icons
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

    const BOOL_OPTIONS = useMemo(
        () => [
            { value: true, label: "Có" },
            { value: false, label: "Không" },
        ],
        []
    );

    // ✅ fetch category detail
    const {
        data: detail,
        isLoading: isDetailLoading,
        isFetching: isDetailFetching,
        error: detailError,
    } = useGetCategoryByIdQuery(id!, { skip: !id });

    // ✅ update mutation
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const currentImageUrl = useMemo(() => {
        if (!detail) return "";
        const c = (detail as any)?.data ?? detail;
        return c?.imageUrl || c?.image || ""; // đổi field theo API của bạn
    }, [detail]);

    useEffect(() => {
        if (!detail) return;
        reset({
            name: detail?.name ?? "",
            parentId: detail?.parentId ?? "",
            isVisible: detail?.isVisible,
            sortOrder: Number(detail?.sortOrder ?? 10),
            menuLabel: detail?.menuLabel ?? "",
            iconUrl: detail?.iconUrl ?? "",
            imageFile: null,
            isFeatured: Boolean(detail?.isFeatured),
        });
    }, [detail, reset]);


    // ✅ prevent memory leak from URL.createObjectURL
    useEffect(() => {
        return () => {
            // chỉ revoke nếu là blob url
            if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const onSubmit: SubmitHandler<CategoryUpdateForm> = async (data) => {
        if (!id) return;

        try {
            // ✅ update: KHÔNG bắt buộc phải chọn ảnh mới
            // nhưng nếu muốn bắt chọn khi category chưa có ảnh -> bạn tự kiểm tra detail.imageUrl

            const fd = new FormData();
            fd.append("name", data.name.trim());
            fd.append("parentId", data.parentId || "");
            fd.append("isVisible", String(data.isVisible));
            fd.append("sortOrder", String(Number(data.sortOrder) || 0));
            fd.append("menuLabel", data.menuLabel.trim());
            fd.append("iconUrl", data.iconUrl.trim());
            fd.append("isFeatured", String(data.isFeatured));

            // ✅ MultipartFile (optional)
            if (data.imageFile) fd.append("image", data.imageFile);

            const res = await updateCategory({ id, body: fd } as any).unwrap();
            toast.success(res?.message ?? "Cập nhật danh mục thành công");

            setTimeout(() => navigate("/categories", { replace: true }), 1200);
        } catch (e: any) {
            toast.error(e?.data?.message ?? "Có lỗi xảy ra");
        }
    };

    const isBusy = isUpdating || isDetailLoading || isDetailFetching;

    return (
        <div className="border-app--rounded bg-white m-4 py-4 position-relative">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between border-bottom px-4 pb-4">
                <div>
                    <div className="fw-bold fs-6">Cập nhật danh mục</div>
                    <div className="f-caption">Chỉnh sửa danh mục và (tuỳ chọn) upload ảnh mới lên Cloudinary.</div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn-app btn-app--ghost btn-app--sm"
                        onClick={() => navigate(-1)}
                        disabled={isBusy}
                        type="button"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        form="category-form"
                        className="btn-app btn-app--sm d-flex align-items-center gap-2"
                        disabled={isBusy}
                    >
                        <RiSaveLine />
                        {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>

            {/* Form */}
            <form id="category-form" className="form-app px-4 pt-4" onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isBusy} style={{ border: 0, padding: 0, margin: 0 }}>
                    {/* error state */}
                    {!!detailError && (
                        <div className="alert alert-danger">
                            Không tải được dữ liệu danh mục. Vui lòng thử lại.
                        </div>
                    )}

                    <div className="row gx-5 gy-4">
                        {/* name */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Tên danh mục: <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control form-control-sm"
                                placeholder="Ví dụ: Điện thoại"
                                {...register("name", { required: "Tên không được để trống." })}
                            />
                            {errors.name && <span className="form-message-error">{errors.name.message}</span>}
                        </div>

                        {/* menuLabel */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Nhãn menu: <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control form-control-sm"
                                placeholder="Ví dụ: Sản phẩm"
                                {...register("menuLabel", { required: "Nhãn menu không được để trống." })}
                            />
                            {errors.menuLabel && (
                                <span className="form-message-error">{errors.menuLabel.message}</span>
                            )}
                        </div>

                        {/* parentId */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">Danh mục cha</label>
                            <Controller
                                name="parentId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        placeholder="Chọn danh mục cha (level 1–2)"
                                        options={parentOptions}
                                        value={parentOptions.find((o) => o.value === field.value) ?? null}
                                        onChange={(opt) => field.onChange((opt as any)?.value ?? "")}
                                        isClearable
                                        isLoading={isParentLoading || isParentFetching}
                                        isDisabled={isBusy}
                                        components={{ Control, DropdownIndicator: null, IndicatorSeparator: null }}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                        </div>

                        {/* sortOrder */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Thứ tự sắp xếp: <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="sortOrder"
                                control={control}
                                rules={{ required: "Vui lòng nhập thứ tự sắp xếp" }}
                                render={({ field }) => (
                                    <>
                                        <input
                                            className="form-control form-control-sm"
                                            type="text"
                                            inputMode="numeric"
                                            value={String(field.value ?? "")}
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 4);
                                                field.onChange(v ? Number(v) : 0);
                                            }}
                                        />
                                        {errors.sortOrder && (
                                            <span className="form-message-error">{errors.sortOrder.message as any}</span>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* iconUrl */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Biểu tượng: <span className="text-danger">*</span>
                            </label>

                            <Controller
                                name="iconUrl"
                                control={control}
                                rules={{ required: "Biểu tượng không được để trống" }}
                                render={({ field }) => (
                                    <>
                                        <Select<IconOption, false>
                                            value={optionIcons.find((o) => o.value === field.value) ?? null}
                                            onChange={(opt) => field.onChange(opt?.value ?? "")}
                                            // ✅ update: vẫn có thể filter như create, hoặc show full list
                                            options={optionIcons.filter((o) => o.value !== field.value)}
                                            isSearchable
                                            isClearable
                                            isDisabled={isBusy}
                                            placeholder="Chọn biểu tượng"
                                            components={{
                                                Option: IconOptionRender,
                                                SingleValue,
                                                Control,
                                                DropdownIndicator: null,
                                                IndicatorSeparator: null,
                                            }}
                                            styles={{
                                                ...selectStyles,
                                                control: (base: any) => ({ ...base, minHeight: 34 }),
                                                valueContainer: (base: any) => ({
                                                    ...base,
                                                    paddingTop: 0,
                                                    paddingBottom: 0,
                                                }),
                                                indicatorsContainer: (base: any) => ({ ...base, height: 34 }),
                                            }}
                                        />
                                        {errors.iconUrl && (
                                            <span className="form-message-error">{errors.iconUrl.message}</span>
                                        )}
                                    </>
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
                                        value={BOOL_OPTIONS.find((x) => x.value === field.value) ?? BOOL_OPTIONS[0]}
                                        onChange={(v) => field.onChange((v as any)?.value ?? true)}
                                        isSearchable={false}
                                        isDisabled={isBusy}
                                        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                                        styles={{
                                            ...selectStyles,
                                            control: (base: any) => ({ ...base, minHeight: 34 }),
                                            valueContainer: (base: any) => ({
                                                ...base,
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                            }),
                                            indicatorsContainer: (base: any) => ({ ...base, height: 34 }),
                                        }}
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
                                        value={BOOL_OPTIONS.find((x) => x.value === field.value) ?? BOOL_OPTIONS[1]}
                                        onChange={(v) => field.onChange((v as any)?.value ?? false)}
                                        isSearchable={false}
                                        isDisabled={isBusy}
                                        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                                        styles={{
                                            ...selectStyles,
                                            control: (base: any) => ({ ...base, minHeight: 34 }),
                                            valueContainer: (base: any) => ({
                                                ...base,
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                            }),
                                            indicatorsContainer: (base: any) => ({ ...base, height: 34 }),
                                        }}
                                    />
                                )}
                            />
                        </div>

                        {/* imageFile */}
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Ảnh danh mục: <span className="text-danger">*</span>
                            </label>

                            <input
                                className="form-control form-control-sm"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    clearErrors("imageFile");
                                    setValue("imageFile", file, { shouldDirty: true, shouldValidate: true });

                                    if (imagePreview?.startsWith("blob:")) {
                                        URL.revokeObjectURL(imagePreview);
                                    }
                                    setImagePreview(URL.createObjectURL(file));
                                }}
                            />

                            {errors.imageFile && (
                                <span className="form-message-error">
                                    {errors.imageFile.message as any}
                                </span>
                            )}

                            {(imagePreview || currentImageUrl) && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview || currentImageUrl}
                                        alt="preview"
                                        style={{
                                            width: 140,
                                            height: 140,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                            border: "1px solid var(--app-border)",
                                        }}
                                    />
                                </div>
                            )}

                            <div className="f-caption mt-2">
                                * Nếu không chọn ảnh mới, hệ thống sẽ giữ nguyên ảnh hiện tại.
                            </div>

                            {imagePreview && (
                                <button
                                    type="button"
                                    className="btn-app btn-app--ghost btn-app--sm mt-2"
                                    onClick={() => {
                                        if (imagePreview.startsWith("blob:")) {
                                            URL.revokeObjectURL(imagePreview);
                                        }
                                        setImagePreview("");
                                        setValue("imageFile", null, { shouldDirty: true });
                                    }}
                                >
                                    Bỏ ảnh mới
                                </button>
                            )}
                        </div>

                    </div>


                    <div className="my-4 border-top" />
                </fieldset>
            </form>
        </div>
    );
};

export default CategoryEdit;
