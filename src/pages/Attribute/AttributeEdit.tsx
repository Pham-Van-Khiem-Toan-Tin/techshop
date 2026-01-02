import {
  RiSave3Line,
} from "react-icons/ri";
import { Controller, useForm, useFieldArray, useWatch, type SubmitHandler } from "react-hook-form"
import { useNavigate, useParams } from "react-router"
import Select from "react-select"
import { type Option } from "../../types/select.type";
import type { AttributeCreateForm, AttributeEditForm } from "../../types/attribute.type";
import { useEditAttributeMutation, useGetAttributeByIdQuery } from "../../features/attribute/attribute.api";
import { toast } from "react-toastify";
import { useEffect } from "react";

const options: Option[] = [
  { value: "TEXT", label: "Văn bản" },
  { value: "NUMBER", label: "Số" },
  { value: "BOOLEAN", label: "Bật/Tắt" },
  { value: "SELECT", label: "Lựa chọn đơn" },
  { value: "MULTI_SELECT", label: "Lựa chọn nhiều" },
  { value: "DATE", label: "Chọn thời gian" },
]

const AttributeEdit = () => {

  const navigate = useNavigate();
  const { id: attributeId } = useParams<{ id: string }>()
  const { register, formState: { errors }, handleSubmit, reset, control, setValue, clearErrors } = useForm<AttributeEditForm>({
    defaultValues: {
      id: "",
      code: "",
      dataType: "",
      unit: "",
      options: undefined,
    }
  })
  const { data: attributeDetail, isLoading: isLoadingDetail, isError, error } = useGetAttributeByIdQuery(attributeId!, { skip: !attributeId })
  
  useEffect(() => {
    if(!attributeDetail) return;
    reset({
      id: attributeDetail.id,
      code: attributeDetail.code,
      label: attributeDetail.label,
      dataType: attributeDetail.dataType,
      unit: attributeDetail.unit,
      options: attributeDetail.options
    })
  }, [attributeDetail, reset])
  

  const [editAttribute, { isLoading: isEditing }] = useEditAttributeMutation()
  const dataType = useWatch({ control, name: "dataType" });
  const isNumber = dataType === "NUMBER";
  const isSelect = dataType === "SELECT" || dataType === "MULTI_SELECT";
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });
  const onDataTypeChangeCleanup = (next: string | null) => {
    if (next !== "NUMBER") {
      setValue("unit", "");
      clearErrors("unit");
    }
    if (next !== "SELECT" && next !== "MULTI_SELECT") {
      setValue("options", undefined);
      clearErrors("options");
    }
  };
  const normalizeOptions = (arr?: { value: string; label: string }[]) =>
    (arr ?? [])
      .map(x => ({ value: x.value?.trim() ?? "", label: x.label?.trim() ?? "" }))
      .filter(x => x.value !== "" && x.label !== "");
  const onSubmit: SubmitHandler<AttributeEditForm> = async (data: AttributeEditForm) => {
    try {
      const isSelect = data.dataType === "SELECT" || data.dataType === "MULTI_SELECT";
      const cleanedOptions = isSelect ? normalizeOptions(data.options) : [];
      if (isSelect && cleanedOptions.length === 0) {
        toast.error("Cần ít nhất 1 lựa chọn hợp lệ (value + label).");
        return;
      }
      const payload: AttributeEditForm = {
        ...data,
        options: cleanedOptions, // SELECT/MULTI_SELECT thì array sạch, còn lại null
        unit: data.dataType === "NUMBER" ? data.unit?.trim() : null,
      };
      const res = await editAttribute({id: payload.id, body: payload}).unwrap()
      toast.success(res.message)
      setTimeout(() => {
        navigate("/attributes", { replace: true })
      }, 1500);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Có lỗi xảy ra")
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="border-app--rounded bg-white" style={{ width: "600px" }}>
        <div className='d-flex align-items-center justify-content-between py-3 px-4 my-2 border-bottom'>
          <div>
            <div className="fw-bold fs-6">Chỉnh sửa thuộc tính</div>
            <div className="f-body-3xs">Định nghĩa trường dữ liệu kỹ thuật cho sản phẩm.</div>
          </div>
          <div className='d-flex align-items-center gap-2'>
            <button onClick={() => navigate(-1)} className='btn-app btn-app--sm btn-app--ghost' >Hủy</button>
            <button type='submit' disabled={isEditing} form='subfunction-form' className='btn-app btn-app btn-app--sm btn-app--default'>
              <RiSave3Line />
              <span>Lưu</span>
            </button>
          </div>
        </div>
        <form id="subfunction-form" onSubmit={handleSubmit(onSubmit)} className="py-3 px-4 mb-5">
          <fieldset disabled={isEditing || isLoadingDetail}>

            <div className="form-app row flex-row gap-0 gy-4">
              <div className="col-6" hidden>
                <label className="form-label" htmlFor="label">Id: <span className="text-danger">*</span></label>
                <input {...register("id", {
                  required: {
                    value: true,
                    message: "Id không được để trống."
                  }
                })}  type="text" id='name' className='form-control form-control-sm' placeholder='Ví dụ: RAM' />
                {errors.id && <span className='form-message-error'>{errors.id?.message}</span>}
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="label">Tên hiển thị: <span className="text-danger">*</span></label>
                <input {...register("label", {
                  required: {
                    value: true,
                    message: "Tên hiển thị được để trống."
                  }
                })}  type="text" id='name' className='form-control form-control-sm' placeholder='Ví dụ: RAM' />
                {errors.label && <span className='form-message-error'>{errors.label?.message}</span>}
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="code">Mã (CODE): <span className="text-danger">*</span></label>
                <input {...register("code", {
                  required: {
                    value: true,
                    message: "Mã không được để trống."
                  }
                })} type="text" id='code' className='form-control form-control-sm' placeholder='Ví dụ: ATT_RAM_LAPTOP' />
                {errors.code && <span className='form-message-error'>{errors.code?.message}</span>}
              </div>

              <div className="col-6">
                <label className="form-label" htmlFor="dataType">Kiểu dữ liệu: <span className="text-danger">*</span></label>

                <Controller
                  name="dataType"
                  control={control}
                  defaultValue={""}
                  rules={{
                    required: {
                      value: true,
                      message: "Kiểu dữ liệu không được để trống."
                    }
                  }}
                  render={({ field }) => (
                    <Select<Option, false>
                      options={options}
                      value={options.find((o) => o.value === field.value) ?? null}
                      isClearable
                      isDisabled={isEditing || isLoadingDetail}
                      onChange={(opt) => {
                        const next = (opt?.value ?? null) as any;
                        field.onChange(next);
                        onDataTypeChangeCleanup(next);
                      }}
                      placeholder="Chọn kiểu dữ liệu"
                      components={{
                        IndicatorSeparator: null
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      styles={{
                        control: (base) => ({ ...base, minHeight: 34 }),
                        valueContainer: (base) => ({ ...base, paddingTop: 0, paddingBottom: 0 }),
                        indicatorsContainer: (base) => ({ ...base, height: 34 }),
                      }}
                    />
                  )}
                />
                {errors.dataType && <span className='form-message-error'>{errors.dataType?.message}</span>}

              </div>
              {isNumber && (
                <div className="col-6">
                  <label className="form-label" htmlFor="unit">Đơn vị: <span className="text-danger">*</span></label>
                  <input {...register("unit", {
                    required: {
                      value: true,
                      message: "Đơn vị được để trống."
                    }
                  })} type="text" id='code' className='form-control form-control-sm' placeholder='Ví dụ: GB' />
                  {errors.unit && <span className='form-message-error'>{errors.unit?.message}</span>}
                </div>
              )}
            </div>
            {isSelect && (
              <div className="col-12 form-app">
                <div className="d-flex align-items-center justify-content-between mt-4">
                  <label className="form-label mb-0 ">
                    Danh sách lựa chọn <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-app btn-app--sm btn-app--ghost"
                    onClick={() => append({ value: "", label: "" })}
                    
                  >
                    + Thêm dòng
                  </button>
                </div>

                <div className="table-responsive table-card--sm">
                  <table className="table table-app align-middle">
                    <thead>
                      <tr>
                        <th>Value</th>
                        <th>Label</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((f, idx) => (
                        <tr key={f.id}>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              
                              {...register(`options.${idx}.value` as const, {
                                validate: (v) => {
                                  if (!isSelect) return true;
                                  return (v?.trim()?.length ?? 0) > 0 || "Giá trị không được để trống.";
                                },
                              })}
                            />
                            {errors.options?.[idx]?.value && (
                              <div className="form-message-error">
                                {String(errors.options[idx]?.value?.message)}
                              </div>
                            )}
                          </td>

                          <td>
                            <input
                              className="form-control form-control-sm"
                              
                              {...register(`options.${idx}.label` as const, {
                                validate: (v) => {
                                  if (!isSelect) return true;
                                  return (v?.trim()?.length ?? 0) > 0 || "Tên hiển thị không được để trống.";
                                },
                              })}
                            />
                            {errors.options?.[idx]?.label && (
                              <div className="form-message-error">
                                {String(errors.options[idx]?.label?.message)}
                              </div>
                            )}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn-app btn-app--sm btn-app--ghost"
                              onClick={() => remove(idx)}
                              disabled={isEditing || isLoadingDetail || fields.length === 1}
                              title="Xóa dòng"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Validate level "ít nhất 1 option hợp lệ" */}
                <input
                  type="hidden"
                  {...register("options", {
                    validate: (arr) => {
                      if (!isSelect) return true;
                      if (!arr || arr.length === 0) return "Cần ít nhất 1 lựa chọn.";
                      const ok = arr.every((x) => x.value?.trim() && x.label?.trim());
                      return ok || "Tất cả lựa chọn phải có Value và Label.";
                    },
                  })}
                />
                {errors.options && typeof errors.options.message === "string" && (
                  <span className="form-message-error">{errors.options.message}</span>
                )}
              </div>
            )}
          </fieldset>
        </form>
      </div>
    </div>
  )
}

export default AttributeEdit