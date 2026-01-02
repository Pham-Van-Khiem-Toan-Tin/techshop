import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Select, { components } from "react-select";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { RiSaveLine } from "react-icons/ri";

import { optionIcons } from "../../features/data/icon.data";
import type { IconOption } from "../../features/data/icon.data";
import { Control, SingleValue } from "../../configs/select.config";
import { selectStyles } from "../../features/data/select.data";

import type { CategoryOption } from "../../types/category.type";
import type { CategoryCreateFormUI } from "../../types/category.type";
import {
  useCreateCategoryMutation,
  useGetCategoryOptionQuery,
} from "../../features/category/category.api";

type ParentSelectOption = {
  value: string;
  label: string;
};

const CategoryCreate = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CategoryCreateFormUI>({
    defaultValues: {
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

  // parent options
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

  // react-select option render for icons
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

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();

  // ✅ prevent memory leak from URL.createObjectURL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onSubmit: SubmitHandler<CategoryCreateFormUI> = async (data) => {
    try {
      // ✅ validate imageFile with RHF error
      if (!data.imageFile) {
        setError("imageFile", {
          type: "required",
          message: "Vui lòng chọn ảnh danh mục",
        });
        toast.error("Vui lòng chọn ảnh danh mục");
        return;
      }

      const fd = new FormData();
      fd.append("name", data.name.trim());
      fd.append("parentId", data.parentId || "");
      fd.append("isVisible", String(data.isVisible));
      fd.append("sortOrder", String(Number(data.sortOrder) || 0));
      fd.append("menuLabel", data.menuLabel.trim());
      fd.append("iconUrl", data.iconUrl.trim());
      fd.append("isFeatured", String(data.isFeatured));

      // ✅ MultipartFile
      fd.append("image", data.imageFile);

      const res = await createCategory(fd).unwrap();
      toast.success(res?.message ?? "Tạo danh mục thành công");

      setTimeout(() => navigate("/categories", { replace: true }), 1200);
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Có lỗi xảy ra");
    }
  };

  return (
    <div className="border-app--rounded bg-white m-4 py-4 position-relative">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between border-bottom px-4 pb-4">
        <div>
          <div className="fw-bold fs-6">Tạo danh mục mới</div>
          <div className="f-caption">Cấu hình danh mục sản phẩm.</div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            className="btn-app btn-app--ghost btn-app--sm"
            onClick={() => navigate(-1)}
            disabled={isCreating}
            type="button"
          >
            Hủy
          </button>

          <button
            type="submit"
            form="category-form"
            className="btn-app btn-app--sm d-flex align-items-center gap-2"
            disabled={isCreating}
          >
            <RiSaveLine />
            {isCreating ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      </div>

      {/* ✅ Form */}
      <form id="category-form" className="form-app px-4 pt-4" onSubmit={handleSubmit(onSubmit)}>
        {/* ✅ Disable all fields while creating */}
        <fieldset disabled={isCreating} style={{ border: 0, padding: 0, margin: 0 }}>
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
                    isDisabled={isCreating}
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
                      options={optionIcons.filter((o) => o.value !== field.value)}
                      isSearchable
                      isClearable
                      isDisabled={isCreating}
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
                    isDisabled={isCreating}
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
                    isDisabled={isCreating}
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
                  const file = e.target.files?.[0] ?? null;

                  if (!file) {
                    setValue("imageFile", null, { shouldDirty: true, shouldValidate: true });
                    setImagePreview("");
                    return;
                  }

                  clearErrors("imageFile");
                  setValue("imageFile", file, { shouldDirty: true, shouldValidate: true });

                  // revoke old preview to avoid leak
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />

              {errors.imageFile && (
                <span className="form-message-error">{errors.imageFile.message as any}</span>
              )}

              {!!imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
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
            </div>
          </div>

          <div className="my-4 border-top" />
        </fieldset>
      </form>
    </div>
  );
};

export default CategoryCreate;
