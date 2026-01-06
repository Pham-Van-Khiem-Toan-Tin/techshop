import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { Group, ProductFormUI, Val } from '../../types/product.type';
import { IoMdAdd } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';
import UploadImageBox from '../../components/common/UploadImageBox';
import { PiImageSquareThin } from 'react-icons/pi';
import { GoStack } from 'react-icons/go';



const SKUTabs = () => {
    const { register, control, setValue, getValues } = useFormContext<ProductFormUI>();
    const attributesOptions = useWatch({ name: "attributeOptions", control })
    const productName = useWatch({ name: "name", control })
    const category = useWatch({ name: "category", control })
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "skuOptions",
        keyName: "_id"
    })
    const watchedSkuOptions = useWatch({ name: "skuOptions", control })
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
    }
    const convertToSkus = (arr: Group[]) => {
        // 1. Lọc: Chỉ lấy những nhóm nào CÓ giá trị bên trong
        // Nếu nhóm rỗng -> Coi như không tồn tại, không nhân vào.
        const validGroups = arr.filter(item => item.values && item.values.length > 0);

        // 2. Map lấy values như cũ
        const valuesArrays: Val[][] = validGroups.map(item => item.values);

        // 3. Trường hợp đặc biệt: Nếu không có nhóm nào hợp lệ (hoặc xóa hết)
        // Thì trả về rỗng để không sinh ra SKU rác
        if (valuesArrays.length === 0) return [];

        // 4. Reduce như cũ
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
    const handleGenerateSkus = (options: Group[]): void => {
        const currentSkus = getValues("skus") || []
        const skusConvert = convertToSkus(options)
        const newSkusList = skusConvert.map(sk => {
            const skuString = sk.map(s => s.value).join("-")
            const skuCode = removeVietnameseTones(
                (productName.trim() || category.slug || "") + "-" + skuString
            );
            const existingSku = currentSkus.find(s => s.skuCode === skuCode)
            return {
                id: existingSku ? existingSku.id : sk.map(s => s.id).join("-"),
                image: existingSku?.image || null,
                skuCode: skuCode,
                name: (productName.trim() || category.name || "") + " " + sk.map(s => s.value).join(" "),
                price: existingSku ? existingSku.price : 0,
                originalPrice: existingSku ? existingSku.originalPrice : 0,
                stock: existingSku ? existingSku.stock : 0,

                attributes: [...sk]
            }
        })

        setValue("skus", newSkusList)
    }
    useEffect(() => {
        // Chỉ chạy khi có dữ liệu

        if (watchedSkuOptions) {
            // Gọi hàm sinh SKU (Logic giữ giá cũ y hệt ở trên)
            handleGenerateSkus(watchedSkuOptions);
        }
    }, [watchedSkuOptions])
    const skus = useWatch({ name: "skus", control })

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const currentGroup = watchedSkuOptions[index];
            const name = currentGroup?.name.trim();
            const value = currentGroup?.value.trim()
            const currentSkus = getValues("skus")

            const groupIds = new Set(currentSkus.flatMap(it => it.attributes).map(o => o.groupId))

            const skuOptionsList = getValues("skuOptions")
            const skuOptionListName = skuOptionsList.map(g => g.name)
            const skuOptionSetName = new Set(skuOptionsList.map(g => g.name))
            const groupNames = new Set(skuOptionsList.filter(g => groupIds.has(g.id)).map(g => g.name))
            if (!value || !name
                || skuOptionListName.length != skuOptionSetName.size
                || currentGroup?.values.some(itg => itg.value == value)
                || (!groupIds.has(currentGroup.id) && groupNames.has(name))
                || (groupIds.has(currentGroup.id) && groupNames.has(value))) {
                toast.error("Dữ liệu không hợp lệ hoặc trùng lặp thuộc tính")
                return
            }
            const newVal = {
                groupId: currentGroup.id,
                id: crypto.randomUUID(),
                value: value
            }
            
            update(index, {
                ...currentGroup,
                values: [...currentGroup.values, newVal],
            })
            setValue(`skuOptions.${index}.value`, "");
        }
    }



    const handDeleteValue = (groupIndex: number, valueId: string) => {
        const currentOptions = getValues("skuOptions");
        const currentGroup = currentOptions[groupIndex];
        const newValues = currentGroup.values.filter(v => v.id !== valueId)
        const updateGroup = {
            ...currentGroup,
            values: newValues
        }
        update(groupIndex, updateGroup)
    }

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
    return (
        <div className='px-4'>
            {attributesOptions != null && attributesOptions.length > 0 ?
                (
                    <div className='row'>
                        <div className='col-4 d-flex flex-column gap-3'>
                            <div className='f-meta f-bold form-label mb-0'>Cấu hình nhóm phân loại</div>
                            <div className='f-caption'>Thêm các nhóm như Màu sắc, Kích thước.</div>
                            {fields?.map((field, index) => (
                                <div key={field.id} className='form-app border-app--rounded p-3'>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <label htmlFor={"name" + index} className='f-body-sm fw-bold'>Tên nhóm phân loại {index + 1}</label>
                                            <button onClick={() => deleteItemGroup(index)} className='btn-app btn-icon btn-app--sm btn-app--outline p-1 border-0 text-danger'>
                                                <RiDeleteBin6Line />
                                            </button>
                                        </div>

                                        <input {...register(`skuOptions.${index}.name`)} className="form-control form-control-sm" id={"name" + index} type="text" placeholder='ví dụ: Màu sắc' />
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        {field.values.map(v => (
                                            <span key={v.id} className='d-inline-block ps-2 bg-neutral-200 f-caption'>
                                                <span>{v.value}</span>
                                                <button onClick={() => handDeleteValue(index, v.id)} className='border-0 bg-transparent'>
                                                    <IoClose />
                                                </button>
                                            </span>

                                        ))}
                                    </div>
                                    <div>
                                        <label htmlFor={"value" + index} className='f-body-sm fw-bold'>Giá trị (Nhập & Enter) {index + 1}</label>
                                        <input {...register(`skuOptions.${index}.value`)} onKeyDown={(e) => handleKeyDown(e, index)} className="form-control form-control-sm" id={"value" + index} type="text" placeholder='Nhập giá trị...' />
                                    </div>
                                </div>
                            ))}
                            <button type='button' onClick={addItemGroup} className='btn-app btn-app--ghost btn-app-icon border-dashed bg-neutral-100 w-100'>
                                <IoMdAdd />
                                <span>Thêm nhóm phân loại</span>
                            </button>
                        </div>
                        <div className='col-8 form-app flex-column'>
                            <div className='f-meta f-bold form-label mb-0'>Danh sách biến thể (SKU)</div>
                            <div className='f-caption'>Vui lòng thêm nhóm phân loại để tạo biến thể.</div>
                            {skus && skus.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='table-app' style={{ width: 800 }}>
                                        <thead>
                                            <tr>
                                                <th scope='col'>Ảnh</th>
                                                <th scope='col'>Tên biến thể</th>
                                                <th scope='col'>Giá bán</th>
                                                <th scope='col'>Giá gốc</th>
                                                <th scope='col'>Kho</th>
                                                <th scope='col'>Mã SKU</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {skus.map((item, index) => (
                                                <tr key={item.id}>
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
                                                                        onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                                        value={field.value}
                                                                        onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                                        style={{ maxWidth: 60 }} />

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
                                                                        onKeyDown={allowNumberAndDotNoLeadingDotKeyDown}
                                                                        value={field.value}
                                                                        onChange={(e) => field.onChange(normalizeNumberDotOnChange(e.target.value))}
                                                                        style={{ maxWidth: 60 }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>
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
                                                                        onKeyDown={allowOnlyNumberKeyDown}
                                                                        onChange={(e) => {
                                                                            const clean = onlyNumberNoLeadingZero(e.target.value)
                                                                            field.onChange(clean);
                                                                        }} style={{ maxWidth: 60 }} />

                                                                </div>
                                                            )}
                                                        />
                                                    </td>

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
                                                                        onChange={field.onChange}
                                                                        style={{ width: 'fit-content' }} />

                                                                </div>
                                                            )}
                                                        />
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