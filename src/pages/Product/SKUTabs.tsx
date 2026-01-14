import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { Group, ProductFormUI, Val } from '../../types/product.type';
import { IoMdAdd } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';
import UploadImageBox from '../../components/common/UploadImageBox';
import { PiEyeSlashThin, PiEyeThin, PiImageSquareThin } from 'react-icons/pi';
import { GoCircleSlash, GoStack } from 'react-icons/go';
import { slugify } from '../../utils/string';
import { HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi2';



const SKUTabs = ({ mode }: { mode: "create" | "edit" }) => {
    const { register, control, setValue, getValues, formState: { errors } } = useFormContext<ProductFormUI>();
    const attributesOptions = useWatch({ name: "attributeOptions", control })
    const productName = useWatch({ name: "name", control })
    const category = useWatch({ name: "category", control })
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "skuOptions",
        keyName: "_id"
    })
    const { fields: skuFields, append: appendSkus, replace: replaceSkus, update: updateSkus, remove: removeSku } = useFieldArray({
        control,
        name: "skus",
        keyName: "skuId"
    })
    const newGroup = (): Group => ({
        id: crypto.randomUUID(),   // nếu env không support, xem fallback bên dưới
        name: "",
        value: "",
        values: [],
    });
    const addItemGroup = () => {
        append(newGroup())
    }
    const deleteItemGroup = (index: number) => {
        remove(index)
        const nextSkuOptions = getValues("skuOptions")
        handleGenerateSkus(nextSkuOptions)
    }
    const convertToSkus = (arr: Group[]) => {
        const validGroups = arr
            .map(g => ({
                ...g,
                values: (g.values ?? []).filter(v => v.active !== false && v.deprecated !== true),
            }))
            .filter(g => g.values.length > 0);

        const valuesArrays: Val[][] = validGroups.map(item => item.values);
        if (valuesArrays.length === 0) return [];

        return valuesArrays.reduce<Val[][]>(
            (acc, cur) => acc.flatMap(a => cur.map(b => [...a, b])),
            [[] as Val[]]
        );
    };
    const removeVietnameseTones = (str: string) => {
        if (!str) return '';

        // 1. Chuyển đổi sang dạng tổ hợp (VD: 'á' -> 'a' + '´')
        str = str.normalize('NFD');

        // 2. Xóa các ký tự dấu (nằm trong dải unicode từ \u0300 đến \u036f)
        str = str.replace(/[\u0300-\u036f]/g, '');

        // 3. Xử lý chữ Đ/đ (Normalize không tách được chữ này)
        str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');

        return str;
    }
    const skuKeyFromAttrs = (attrs: Val[]) =>
        attrs
            .slice()
            .sort((a, b) => (a.groupId + a.id).localeCompare(b.groupId + b.id))
            .map(a => `${a.groupId}:${a.id}`)
            .join("|");

    const handleGenerateSkus = (options: Group[]) => {
        const currentSkus = getValues("skus") || [];
        const combos = convertToSkus(options);

        const newSkusList = combos.map(attrs => {
            const key = skuKeyFromAttrs(attrs);

            const existingSku = currentSkus.find(s => s.key === key);
            const skuString = attrs.map(s => s.value).join("-");
            const skuCode = removeVietnameseTones(slugify((productName.trim() || category.slug || "") + "-" + skuString));

            return {
                ...existingSku,
                key,
                id: existingSku?.id || key,
                image: existingSku?.image || null,
                skuCode: existingSku?.skuCode || skuCode,
                name: existingSku?.name || (productName.trim() || category.name || "") + " " + attrs.map(s => s.value).join(" "),
                price: existingSku?.price ?? 0,
                originalPrice: existingSku?.originalPrice ?? 0,
                stock: existingSku?.stock ?? 0,
                costPrice: existingSku?.costPrice ?? 0,
                active: true,
                discontinued: false,
                attributes: attrs
            };
        });


        replaceSkus([...newSkusList]);
    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const watchedSkuOptions = getValues("skuOptions")
            if (watchedSkuOptions.length == 0) {
                const name = getValues("draft.name")?.trim()
                const value = getValues("draft.value")?.trim()
                if (!name || !value || value == name) {
                    toast.error("Vui lòng nhập giá trị phân loại")
                    return;
                }
                const newId = crypto.randomUUID()
                append({
                    id: newId,
                    name: name,
                    value: "",
                    values: [{
                        groupId: newId,
                        id: crypto.randomUUID(),
                        value: value,
                        active: true,
                    }]
                })


            } else {
                const currentGroup = watchedSkuOptions[index];

                const name = currentGroup?.name.trim();
                const value = currentGroup?.value.trim();
                if (!name || !value || name == value) {
                    toast.error("Dữ liệu không hợp lệ")
                    return;
                }
                const skuOptionListName = watchedSkuOptions.map(g => normalizeName(g.name));
                const currentGroupOptionValue = currentGroup.values.map(it => normalizeName(it.value));
                if (!currentGroup.name && skuOptionListName.includes(normalizeName(name))) {
                    toast.error("Dữ liệu không hợp lệ");
                    return;
                }
                if (currentGroupOptionValue.includes(normalizeName(value))) {
                    toast.error("Dữ liệu không hợp lệ");
                    return;
                }
                const newVal = {
                    groupId: currentGroup.id,
                    id: crypto.randomUUID(),
                    value: value,
                    active: true,
                }

                update(index, {
                    ...currentGroup,
                    values: [...currentGroup.values, newVal],
                })
                setValue(`skuOptions.${index}.value`, "");
            }
            const nextSkuOptions = getValues("skuOptions")
            handleGenerateSkus(nextSkuOptions)
        }
    }
    const normalizeName = (name: string) => {
        return name.trim().replaceAll(/\s+/g, " ").toLowerCase();
    }
    const handDeleteValue = (groupIndex: number, valueId: string) => {
        const currentOptions = getValues("skuOptions");
        const currentGroup = currentOptions[groupIndex];
        const currentSkus = getValues("skus") ?? [];

        const usedByLockedSku = currentSkus.some(
            s => s.locked && s.attributes.some(a => a.id === valueId)
        );

        const newValues = currentGroup.values.map(v => {
            if (v.id !== valueId) return v;
            if (v.used || usedByLockedSku) return { ...v, active: false, deprecated: true };
            return null as any;
        }).filter(Boolean);

        update(groupIndex, { ...currentGroup, values: newValues });

        handleGenerateSkus(getValues("skuOptions"));
    };

    const onlyNumberNoLeadingZero = (value: string) => {
        // 1. Xóa mọi ký tự không phải số
        let v = value.replace(/\D+/g, '');

        // 2. Xóa số 0 ở đầu (nhưng giữ lại "0" nếu chỉ có 0)
        v = v.replace(/^0+(?=\d)/, '');

        return v;
    };
    const allowOnlyNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedKeys = [
            "Backspace", "Delete", "Tab", "Enter", "Escape",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ];

        // Cho phép Ctrl/Cmd shortcuts: copy/paste/cut/select all
        if (e.ctrlKey || e.metaKey) return;

        if (allowedKeys.includes(e.key)) return;

        // Cho phép số
        if (/^\d$/.test(e.key)) return;

        // Còn lại chặn
        e.preventDefault();
    };
    const allowNumberAndDotNoLeadingDotKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        const allowedKeys = [
            "Backspace", "Delete", "Tab", "Enter", "Escape",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ];

        if (e.ctrlKey || e.metaKey) return;
        if (allowedKeys.includes(e.key)) return;

        const input = e.currentTarget;

        // Cho phép số
        if (/^\d$/.test(e.key)) return;

        // Cho phép dấu . nhưng:
        if (e.key === ".") {
            // không cho "." ở đầu (kể cả đang chọn toàn bộ)
            const isStart = (input.selectionStart ?? 0) === 0;
            const willBeEmpty = input.value.length === 0 || input.value === input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0);
            if (isStart && willBeEmpty) {
                e.preventDefault();
                return;
            }

            // không cho nhiều dấu .
            if (input.value.includes(".")) {
                e.preventDefault();
                return;
            }
            return;
        }

        e.preventDefault();
    };
    const normalizeNumberDotOnChange = (raw: string) => {
        // 1) chỉ giữ số và .
        let v = raw.replace(/[^0-9.]/g, "");

        // 2) chỉ cho 1 dấu .
        const firstDot = v.indexOf(".");
        if (firstDot !== -1) {
            v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
        }

        // 3) không cho "." ở đầu -> đổi ".5" thành "0.5"
        if (v.startsWith(".")) v = "0" + v;

        // 4) xóa 0 ở đầu phần nguyên (nhưng giữ "0.xxx")
        const [intPart, decPart] = v.split(".");
        let intNorm = intPart.replace(/^0+(?=\d)/, ""); // 00012 -> 12

        // nếu int rỗng (trường hợp "000" -> ""), cho về "0"
        if (intNorm === "") intNorm = "0";

        return decPart !== undefined ? `${intNorm}.${decPart}` : intNorm;
    };
    const handleBulkApplyAll = () => {

        const skusValue = getValues("skus") ?? []
        const bulk = getValues("bulk")
        skusValue.forEach((sku, i) => {
            if (bulk.price !== null && bulk.price != null)
                setValue(`skus.${i}.price`, bulk.price, { shouldDirty: true, shouldValidate: false });

            if (bulk.costPrice !== null && bulk.costPrice != null)
                setValue(`skus.${i}.costPrice`, bulk.costPrice, { shouldDirty: true, shouldValidate: false });

            if (bulk.originalPrice !== null && bulk.originalPrice != null)
                setValue(`skus.${i}.originalPrice`, bulk.originalPrice, { shouldDirty: true, shouldValidate: false });

            if (bulk.stock !== null && bulk.stock != null)
                setValue(`skus.${i}.stock`, bulk.stock, { shouldDirty: true, shouldValidate: false });
        })
    };
    const [discontinuedSelected, setDiscontinuedSelected] = useState(null);
    return (
        <div className='px-4'>
            {attributesOptions != null && attributesOptions.length > 0 ?
                (
                    <div className='row'>
                        <div className='col-4 d-flex flex-column gap-3'>
                            <div className='f-meta f-bold form-label mb-0'>Cấu hình nhóm phân loại</div>
                            <div className='f-caption'>Thêm các nhóm như Màu sắc, Kích thước.</div>
                            {fields && fields.length > 0 ? fields?.map((field, index) => (
                                <div key={field._id} className='form-app border-app--rounded p-3'>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <label htmlFor={"name" + index} className='f-body-sm fw-bold'>Tên nhóm phân loại {index + 1}</label>
                                            {fields.length > 1 && fields.flatMap(it => it.values).some(it => !it.isOldData) &&
                                                <button type='button' onClick={() => deleteItemGroup(index)} className='btn btn-secondary border-0 bg-transparent text-secondary'>
                                                    <RiDeleteBin6Line />
                                                </button>}
                                        </div>

                                        <input {...register(`skuOptions.${index}.name`)} className="form-control form-control-sm" id={"name" + index} type="text" placeholder='ví dụ: Màu sắc' />
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        {field.values.map(v => (
                                            <span key={v.id} className='d-inline-block ps-2 bg-neutral-200 f-caption'>
                                                <span>{v.value}</span>
                                                {v.isOldData ? (
                                                    <button type='button' className='border-0 bg-transparent'>
                                                        {v.active ? (<PiEyeSlashThin />) : (<PiEyeThin />)}
                                                    </button>
                                                ) : (

                                                    <button type='button' onClick={() => handDeleteValue(index, v.id)} className='border-0 bg-transparent'>
                                                        <IoClose />
                                                    </button>
                                                )}
                                            </span>

                                        ))}
                                    </div>
                                    <div>
                                        <label htmlFor={"value" + index} className='f-body-sm fw-bold'>Giá trị (Nhập & Enter) {index + 1}</label>
                                        <input {...register(`skuOptions.${index}.value`)} onKeyDown={(e) => handleKeyDown(e, index)} className="form-control form-control-sm" id={"value" + index} type="text" placeholder='Nhập giá trị...' />
                                    </div>
                                </div>
                            )) : (
                                <div className='form-app border-app--rounded p-3'>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <label htmlFor="name1" className='f-body-sm fw-bold'>Tên nhóm phân loại 1</label>
                                        </div>

                                        <input {...register("draft.name", {
                                            required: true
                                        })} className={`form-control form-control-sm ${errors.draft?.name && "is-invalid"}`} id="name1" type="text" placeholder='ví dụ: Màu sắc' />
                                    </div>
                                    <div>
                                        <label htmlFor="value1" className='f-body-sm fw-bold'>Giá trị (Nhập & Enter)</label>
                                        <input {...register("draft.value", {
                                            required: true
                                        })} onKeyDown={(e) => handleKeyDown(e, 1)} className={`form-control form-control-sm ${errors.draft?.name && "is-invalid"}`} id="value1" type="text" placeholder='Nhập giá trị...' />
                                    </div>
                                </div>
                            )}
                            {mode == "create" && (
                                <button type='button' onClick={addItemGroup} className='btn-app btn-app--ghost btn-app-icon border-dashed bg-neutral-100 w-100'>
                                    <IoMdAdd />
                                    <span>Thêm nhóm phân loại</span>
                                </button>
                            )}
                        </div>
                        <div className='col-8 form-app flex-column'>
                            <div className='f-meta f-bold form-label mb-0'>Danh sách biến thể (SKU)</div>
                            <div className='f-caption'>Vui lòng thêm nhóm phân loại để tạo biến thể.</div>
                            <div className='form-app'>
                                <div className='row'>
                                    <div className='col-3'>
                                        <label className='form-label' htmlFor="bulk-price">Giá bán</label>
                                        <Controller
                                            control={control}
                                            name='bulk.price'
                                            render={({ field }) => (
                                                <input id='bulk-price' className='form-control form-control-sm' type="text"
                                                    value={field.value}
                                                    onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                    onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className='col-3'>
                                        <label className='form-label' htmlFor="bulk-costPrice">Giá gốc</label>
                                        <Controller
                                            control={control}
                                            name='bulk.costPrice'
                                            render={({ field }) => (
                                                <input id='bulk-costPrice' className='form-control form-control-sm' type="text"
                                                    value={field.value}
                                                    onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                    onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className='col-3'>
                                        <label className='form-label' htmlFor="bulk-originalPrice">Giá niêm yết</label>
                                        <Controller
                                            control={control}
                                            name='bulk.originalPrice'
                                            render={({ field }) => (
                                                <input id='bulk-originalPrice' className='form-control form-control-sm' type="text"
                                                    value={field.value}
                                                    onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                    onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className='col-3'>
                                        <label className='form-label' htmlFor="bulk-stock">Số lượng</label>
                                        <Controller
                                            control={control}
                                            name='bulk.stock'
                                            render={({ field }) => (
                                                <input id='bulk-stock' className='form-control form-control-sm' type="text"
                                                    value={field.value}
                                                    onKeyDown={allowOnlyNumberKeyDown}
                                                    onChange={(e) => field.onChange(onlyNumberNoLeadingZero(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className='d-flex align-items-end col-12 mt-2'>
                                        <button onClick={handleBulkApplyAll} type='button' className='btn-app btn-app--sm'>
                                            Áp dụng hàng loạt
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {skuFields && skuFields.length > 0 ? (
                                <div className='table-responsive'>
                                    <table className='table-app' style={{ width: 800 }}>
                                        <thead>
                                            <tr>
                                                <th scope='col'>Ảnh</th>
                                                <th scope='col'>Tên biến thể</th>
                                                <th scope='col'>Giá bán</th>
                                                <th scope='col'>Giá gốc</th>
                                                {mode == "create" && (
                                                    <th scope='col'>Kho</th>
                                                )}
                                                <th scope='col'>Mã SKU</th>
                                                <th scope='col'>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {skuFields.map((item, index) => (
                                                <tr key={item.skuId}>
                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`skus.${index}.image`}
                                                            rules={{
                                                                required: {
                                                                    value: true,
                                                                    message: "Ảnh không được để trống"
                                                                }
                                                            }}
                                                            render={({ field, fieldState }) => (
                                                                <UploadImageBox
                                                                    value={field.value}
                                                                    picker={true}
                                                                    disabled={item.discontinued}
                                                                    message=''
                                                                    error={fieldState.error?.message}
                                                                    width='36px'
                                                                    height='36px'
                                                                    Icon={<PiImageSquareThin />}
                                                                    onChange={field.onChange}
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`skus.${index}.name`}
                                                            rules={{
                                                                required: {
                                                                    value: true,
                                                                    message: "Tên không được để trống"
                                                                }
                                                            }}
                                                            render={({ field, fieldState }) => (
                                                                <div className='d-flex flex-column justify-content-start'>
                                                                    <input
                                                                        className={`form-control form-control-sm ${fieldState.error && "is-invalid"}`}
                                                                        type="text"
                                                                        disabled={item.discontinued}

                                                                        value={field.value}
                                                                        onChange={field.onChange}
                                                                        style={{ width: 'fit-content' }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`skus.${index}.price`}
                                                            rules={{
                                                                required: {
                                                                    value: true,
                                                                    message: "Giá bán không được để trống"
                                                                },
                                                                validate: {
                                                                    equalZero: (v) =>
                                                                        Number(v) > 0 || "Giá trị phải lớn hơn 0"
                                                                }
                                                            }}
                                                            render={({ field, fieldState }) => (
                                                                <div className='d-flex flex-column justify-content-start'>
                                                                    <input
                                                                        className={`form-control form-control-sm ${fieldState.error && "is-invalid"}`}
                                                                        type="text"
                                                                        disabled={item.discontinued}
                                                                        onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                                        value={field.value}
                                                                        onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                                        style={{ minWidth: 100 }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`skus.${index}.originalPrice`}
                                                            rules={{
                                                                required: {
                                                                    value: true,
                                                                    message: "Giá gốc không được để trống"
                                                                },
                                                                validate: {
                                                                    equalZero: (v) =>
                                                                        Number(v) > 0 || "Giá trị phải lớn hơn 0"
                                                                }
                                                            }}
                                                            render={({ field, fieldState }) => (
                                                                <div className='d-flex flex-column justify-content-start'>
                                                                    <input
                                                                        className={`form-control form-control-sm ${fieldState.error && "is-invalid"}`}
                                                                        type="text"
                                                                        disabled={item.discontinued}
                                                                        onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                                        value={field.value}
                                                                        onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                                        style={{ minWidth: 100 }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>
                                                    {mode == "create" && (
                                                        <td>
                                                            <Controller
                                                                control={control}
                                                                name={`skus.${index}.stock`}
                                                                rules={{
                                                                    required: {
                                                                        value: true,
                                                                        message: "Tồn kho không được để trống"
                                                                    },
                                                                    validate: {
                                                                        equalZero: (v) =>
                                                                            Number(v) > 0 || "Giá trị phải lớn hơn 0"
                                                                    }
                                                                }}
                                                                render={({ field, fieldState }) => (
                                                                    <div className='d-flex flex-column justify-content-start'>
                                                                        <input type="text"
                                                                            className={`form-control form-control-sm ${fieldState.error && "is-invalid"}`}
                                                                            value={field.value}
                                                                            disabled={item.discontinued}
                                                                            onKeyDown={allowOnlyNumberKeyDown}
                                                                            onChange={(e) => {
                                                                                const clean = onlyNumberNoLeadingZero(e.target.value)
                                                                                field.onChange(clean);
                                                                            }} style={{ minWidth: 100 }} />

                                                                    </div>
                                                                )}
                                                            />
                                                        </td>
                                                    )}

                                                    <td>
                                                        <Controller
                                                            control={control}
                                                            name={`skus.${index}.skuCode`}
                                                            rules={{
                                                                required: {
                                                                    value: true,
                                                                    message: "Mã Sku không được để trống"
                                                                }
                                                            }}
                                                            render={({ field, fieldState }) => (
                                                                <div>
                                                                    <input type="text"

                                                                        className={`form-control form-control-sm ${fieldState.error && "is-invalid"}`}
                                                                        value={field.value}
                                                                        disabled={mode == "edit"}
                                                                        onChange={field.onChange}
                                                                        style={{ width: 'fit-content' }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>
                                                    <td className='col-actions'>
                                                        <div className='table-actions'>
                                                            <button disabled={item.discontinued} className='action-btn' onClick={() => updateSkus(index, {
                                                                ...item,
                                                                active: !item.active
                                                            })}>
                                                                {item.active ? <HiOutlineLockClosed /> : <HiOutlineLockOpen />}
                                                            </button>
                                                            {mode == "create" &&
                                                                <button className='action-btn action-btn--danger' onClick={() => removeSku(index)}>
                                                                    <RiDeleteBin6Line />
                                                                </button>
                                                            }
                                                            {mode == "edit" &&
                                                                <button className='action-btn action-btn--danger' onClick={() => removeSku(index)}>
                                                                    <GoCircleSlash />
                                                                </button>
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            ) : (
                                <div className='d-flex align-items-center gap-1 f-hint flex-column justify-content-center my-5'>
                                    <GoStack size={60} />
                                    <span className='f-body'>Chưa có biến thể nào được tạo.</span>
                                    <span className='f-body-3xs'>Thêm nhóm phân loại ở cột bên trái để bắt đầu.</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='d-flex align-items-center justify-content-center p-5 bg-neutral-100 rounded mt-4'>
                        <span>Vui lòng chọn danh mục trước.</span>
                    </div >
                )
            }
        </div >
    )
}

export default SKUTabs