

import { selectStyles } from '../../features/data/select.data'
import Select from "react-select";
import { Controller, useFormContext } from 'react-hook-form';
import type { ProductFormUI } from '../../types/product.type';
import UploadImageBox from '../../components/common/UploadImageBox';
import { PiImageSquareLight } from 'react-icons/pi';
import { IoAdd } from 'react-icons/io5';
import { useGetBrandOptionQuery } from '../../features/brand/brand.api';
import type { Option } from '../../types/select.type';
import { useGetLeafCategoryQuery, useLazyGetCategoryByIdQuery } from '../../features/category/category.api';
import { toast } from 'react-toastify';

const GeneralTabs = () => {
    const { register, control, setValue, formState: { errors } } = useFormContext<ProductFormUI>();
    const { data: dataBrand, isLoading: isBrandLoading } = useGetBrandOptionQuery(null);
    const { data: dataCategory, isLoading: isCategoryLoading } = useGetLeafCategoryQuery(null);
    const [getCategoryDetail, {isLoading: isAttributeLoading}] = useLazyGetCategoryByIdQuery();
    return (
        <div className="px-4">
            <div className="row">
                <div className="col-8">
                    <div className="f-section">Thông tin cơ bản</div>
                    <div className="row mt-3">
                        <div className="col-12">
                            <label className="form-label">
                                Tên sản phẩm: <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control form-control-sm"
                                placeholder="Ví dụ: Iphone 15 Pro Max"
                                {...register("name", { required: "Tên sản phẩm không được để trống." })}
                            />
                            {errors.name && <span className="form-message-error">{errors.name.message}</span>}
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">
                                Slug: <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control form-control-sm"
                                placeholder="Ví dụ: Sản phẩm"
                                {...register("slug", { required: "Nhãn menu không được để trống." })}
                            />
                            {errors.slug && (
                                <span className="form-message-error">{errors.slug.message}</span>
                            )}
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Thương hiệu: <span className="text-danger">*</span></label>
                            <Controller
                                name="brandId"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Thương hiệu không được để trống."
                                    }
                                }}
                                render={({ field }) => (
                                    <Select<Option>
                                        placeholder="Chọn thương hiệu"
                                        options={dataBrand?.map(item => ({ value: item.id, label: item.name })).filter(item => item.value != field.value)}
                                        value={dataBrand?.map(item => ({ value: item.id, label: item.name })).find((o) => o.value === field.value) ?? null}
                                        onChange={(opt) => field.onChange(opt?.value)}
                                        isSearchable
                                        isClearable
                                        isLoading={isBrandLoading}
                                        isDisabled={isBrandLoading}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                            {errors.brandId && (
                                <span className="form-message-error">{errors.brandId.message}</span>
                            )}
                        </div>
                        <div className="col-12">
                            <label className="form-label">Danh mục: <span className="text-danger">*</span></label>
                            <Controller
                                name="categoryId"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: "Danh mục không được để trống."
                                    }
                                }}
                                render={({ field }) => (
                                    <Select<Option>
                                        placeholder="Chọn danh mục"
                                        options={dataCategory?.map(item => ({ value: item.id, label: item.name })).filter(op => op.value != field.value)}
                                        value={dataCategory?.map(item => ({ value: item.id, label: item.name })).find((o) => o.value === field.value) ?? null}
                                        onChange={async (opt) => {
                                            const categoryId = (opt as any)?.value ?? "";
                                            field.onChange(categoryId);
                                            if (!categoryId) {
                                                return;
                                            }
                                            try {
                                                const res = await getCategoryDetail(categoryId);
                                                const {data} = res;
                                                console.log(data);
                                                
                                                setValue("attributeOptions", (data?.attributeConfigs ?? []).map(item => ({
                                                    id: item.id,
                                                    code: item.code,
                                                    label: item.label,
                                                    isRequired: item.isRequired,
                                                    isFilterable: item.isFilterable,
                                                    displayOrder: item.displayOrder,
                                                    unit: item.unit,
                                                    dataType: item.dataType,
                                                    options: (item.optionsValue ?? []).filter(ot => ot.active).map(ot => ({
                                                        value: ot.value,
                                                        label: ot.label,
                                                        selected: false
                                                    }))
                                                })));
                                                setValue("attributes", (data?.attributeConfigs ?? []).map((item) => ({
                                                    id: item.id,
                                                    code: item.code,
                                                    name: item.label,
                                                    unit: item.unit,
                                                    value: "",
                                                    label: ""
                                                })))
                                            } catch (error: any) {
                                                toast.error(error?.data?.message ?? "Không lấy được thông tin danh mục");
                                            }
                                        }}
                                        isSearchable
                                        isLoading={isCategoryLoading}
                                        isDisabled={isCategoryLoading || isAttributeLoading}
                                        styles={selectStyles}
                                    />
                                )}
                            />
                            {errors.categoryId && (
                                <span className="form-message-error">{errors.categoryId.message}</span>
                            )}
                        </div>

                    </div>
                </div>
                <div className="col-4">
                    <div>
                        <div className='fw-bold'>Ảnh đại diện</div>
                        <Controller
                            control={control}
                            name="image"
                            rules={{
                                required: "Vui lòng chọn ảnh",
                                validate: (value) => {
                                    // 1. Edit mode: logo cũ (string url) → hợp lệ
                                    if (typeof value === "string") return true;

                                    // 2. Không chọn gì
                                    if (!value) return true; // hoặc false nếu create bắt buộc

                                    // 3. Validate file mới
                                    if (value.size > 5 * 1024 * 1024) {
                                        return "Tối đa 5MB";
                                    }

                                    const okTypes = ["image/jpeg", "image/png", "image/webp"];
                                    if (!okTypes.includes(value.type)) {
                                        return "Chỉ hỗ trợ JPG/PNG/WEBP";
                                    }

                                    return true;
                                },
                            }}
                            render={({ field, fieldState }) => (
                                <UploadImageBox
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    width='100%'
                                    height='300px'
                                    picker={true}
                                    message='Tải ảnh lên'
                                    Icon={<PiImageSquareLight size={60} />}
                                />

                            )}
                        />
                        {errors.image && <span className='form-message-error'>{errors.image?.message}</span>}

                    </div>
                    <div>
                        <div className='fw-bold mt-3'>Thư viện ảnh</div>
                        <div>
                            <Controller
                                control={control}
                                name='gallery'
                                rules={{
                                    required: "Vui lòng chọn ảnh",
                                    validate: (value) => {
                                        // 1. Không có gì
                                        if (!value || value.length === 0) {
                                            return "Vui lòng chọn ít nhất 1 ảnh";
                                        }

                                        // 2. Validate từng ảnh
                                        for (const item of value) {
                                            // ảnh cũ
                                            if (typeof item === "string") continue;

                                            // file mới
                                            if (item.size > 5 * 1024 * 1024) {
                                                return "Mỗi ảnh tối đa 5MB";
                                            }

                                            const okTypes = ["image/jpeg", "image/png", "image/webp"];
                                            if (!okTypes.includes(item.type)) {
                                                return "Chỉ hỗ trợ JPG/PNG/WEBP";
                                            }
                                        }

                                        return true;
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <UploadImageBox
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        error={fieldState.error?.message}
                                        multiple={true}
                                        width='80px'
                                        height='80px'
                                        picker={true}
                                        message=''
                                        Icon={<IoAdd size={20} />}
                                    />

                                )}
                            />
                            {errors.gallery && <span className='form-message-error'>{errors.gallery?.message}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeneralTabs