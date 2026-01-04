import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { ProductFormUI } from '../../types/product.type';
import Select from 'react-select';
import { selectStyles } from '../../features/data/select.data';

const AttributeTabs = () => {
    const { register, control, setValue, formState: { errors } } = useFormContext<ProductFormUI>();
    const attributesOptions = useWatch({ name: "attributeOptions", control })
    const attributes = useWatch({ name: "attributes", control })
    console.log(attributesOptions);
    const sortList = [...(attributesOptions ?? [])].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
    return (
        <div className='px-4'>
            <div className="f-section">Thông số kỹ thuật</div>
            <div className='f-caption'>Các trường này thay đổi dựa trên danh mục bạn chọn ở tab "Thông tin chung".</div>
            {
                attributesOptions != null && attributesOptions.length > 0 ? (
                    <div className='row gy-2'>
                        {(sortList ?? []).map((opt) => {
                            const attrs = attributes ?? [];
                            const attrIndex = attrs.findIndex(a => a.id === opt.id);
                            if (attrIndex === -1) return null;
                            if (opt.dataType === "SELECT" || opt.dataType === "MULTIPLE_SELECT") {

                                const selectedValue = attributes[attrIndex]?.value;

                                const selectOptions = (opt.options ?? []).map(o => ({
                                    value: o.value,
                                    label: o.label,
                                }));
                                console.log(selectedValue);

                                const selectedOption =
                                    selectOptions.find(o => o.value === selectedValue) ?? null;
                                console.log(selectedOption);
                                return (
                                    <Controller
                                        key={opt.id}
                                        control={control}
                                        name={`attributes.${attrIndex}.value`}
                                        rules={{
                                            required: opt.isRequired ? `${opt.label} là bắt buộc` : false,
                                        }}
                                        render={({ field, fieldState }) => (
                                            <div className='col-6'>
                                                <label htmlFor={opt.id} className='form-label'>{`${opt.label}:`} {opt.isRequired && (<span className='text-danger'>*</span>)}</label>
                                                <Select
                                                    options={selectOptions}
                                                    value={selectedOption}
                                                    placeholder={`Chọn ${opt.label}`}
                                                    onChange={(selected) => {
                                                        // set value cho RHF
                                                        field.onChange(selected?.value ?? "");
                                                        console.log(selected?.value);

                                                        // set label vào field sibling
                                                        setValue(`attributes.${attrIndex}.label`, selected?.label ?? "", {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        });
                                                    }}
                                                    isClearable
                                                    isSearchable
                                                    isMulti={opt.dataType === "MULTIPLE_SELECT"}
                                                    styles={selectStyles}
                                                />
                                                {fieldState.error && (
                                                    <div className="form-message-error">{fieldState.error.message}</div>
                                                )}
                                            </div>
                                        )}
                                    />
                                )
                            }
                            else if (opt.dataType != "BOOLEAN") {
                                return (
                                    <div key={opt.id} className='col-6 d-flex flex-column'>
                                        <label htmlFor={opt.id} className='form-label'>{`${opt.label}:`} {opt.isRequired && (<span className='text-danger'>*</span>)}</label>
                                        <input className='form-control form-control-sm'
                                            id={opt.id}
                                            type={(opt.dataType ?? "").toLowerCase()}
                                            {...register(`attributes.${attrIndex}.value`, {
                                                required: opt.isRequired ? `${opt.label} là bắt buộc` : false,
                                            })}
                                            placeholder={`Điền ${(opt.label ?? "").toLowerCase()}`}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setValue(`attributes.${attrIndex}.value`, v, { shouldDirty: true, shouldValidate: true });
                                            }}
                                        />
                                        {errors.attributes?.[attrIndex]?.value && (
                                            <span className="form-message-error">
                                                {String(errors.attributes[attrIndex]?.value?.message)}
                                            </span>
                                        )}
                                    </div>

                                )

                            } else {
                                return (
                                    <div key={opt.id} className='col-6 d-flex flex-column'>
                                        <label htmlFor={opt.id} className='form-label'>{`${opt.label}:`} {opt.isRequired && (<span className='text-danger'>*</span>)}</label>
                                        <Controller
                                            control={control}
                                            name={`attributes.${attrIndex}.value`}
                                            rules={{
                                                validate: (v) => (!opt.isRequired ? true : v === true ? true : `${opt.label} là bắt buộc`),
                                            }}
                                            render={({ field, fieldState }) => (
                                                <input
                                                    id={opt.id}
                                                    className={`form-check-input ${fieldState.error ? "is-invalid" : ""}`}
                                                    type='checkbox'
                                                    checked={Boolean(field.value)}
                                                    onChange={(e) => {
                                                        const v = e.target.checked;
                                                        field.onChange(v);
                                                        setValue(`attributes.${attrIndex}.label`, v ? "Có" : "Không", { shouldDirty: true });
                                                    }}
                                                />

                                            )}
                                        />
                                        {errors.attributes?.[attrIndex]?.value && (
                                            <span className="form-message-error">
                                                {String(errors.attributes[attrIndex]?.value?.message)}
                                            </span>
                                        )}
                                    </div>
                                )
                            }
                        })}
                    </div>
                ) : (
                    <div className='d-flex align-items-center justify-content-center p-5 bg-neutral-100 rounded mt-4'>
                        <span>Vui lòng chọn danh mục trước.</span>
                    </div>
                )
            }
        </div>
    )
}

export default AttributeTabs