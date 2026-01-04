import React, { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form';
import type { ProductFormUI } from '../../types/product.type';
import { IoMdAdd } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5';

interface Group {
    id: string,
    name: string,
    value: string,
    values: {
        id: string,
        content: string,
    }[]
}

const SKUTabs = () => {
    const { register, control, setValue, formState: { errors } } = useFormContext<ProductFormUI>();
    const attributesOptions = useWatch({ name: "attributeOptions", control })
    const [group, setGroup] = useState<Group[]>([{
        id: crypto.randomUUID(),
        name: "",
        value: "",
        values: []
    }])
    const newGroup = (): Group => ({
        id: crypto.randomUUID(),   // nếu env không support, xem fallback bên dưới
        name: "",
        value: "",
        values: [],
    });
    const addItemGroup = () => {
        setGroup(prev => [...prev, newGroup()])
    }
    const deleteItemGroup = (id: string) => {
        setGroup(prev => prev.filter(g => g.id !== id));
    }
    const listAttributeNames = new Set((attributesOptions ?? []).map(item => item.label));
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const itemGroup = group.find(item => item.id == id)
            const name = itemGroup?.name.trim();
            const value = itemGroup?.value.trim()
            if (!value || !name || listAttributeNames.has(name) || itemGroup?.values.some(itg => itg.content == name)) {
                toast.error("Dữ liệu không hợp lệ hoặc trùng lặp thuộc tính")
                return
            }
            setGroup(pre =>
                pre.map(item => {
                    if (item.id == id) return {
                        id: item.id,
                        name: item.name, value: "",
                        values: [...item.values, {
                            id: crypto.randomUUID(),
                            content: value
                        }]
                    }
                    else { return { ...item } }
                })
            )
        }
    }
    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setGroup(pre => pre.map((it) => {
            if (it.id == id) { return { id: it.id, name: e.target.value, value: it.value, values: it.values } }
            else { return { ...it } }
        }))
    }
    const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const value = e.target.value;
        setGroup(prev =>
            prev.map(item => {
                if (item.id != id) return item
                return {
                    ...item,
                    value: value,
                }
            })
        );

    }
    const handDeleteValue = (itemId: string, valueId: string) => {
        setGroup(pre => 
            pre.map(item => {
                if(item.id != itemId) return item;
                return {
                    ...item,
                    values: item.values.filter(v => v.id != valueId)
                }
            })
        )
    }
    return (
        <div className='px-4'>
            {attributesOptions != null && attributesOptions.length > 0 ?
                (
                    <div className='row'>
                        <div className='col-4 d-flex flex-column gap-3'>
                            {group?.map((item, index) => (
                                <div key={item.id} className='form-app border-app--rounded p-3'>
                                    <div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <label htmlFor={"name" + index} className='f-body-sm fw-bold'>Tên nhóm phân loại {index + 1}</label>
                                            <button onClick={() => deleteItemGroup(item.id)} className='btn-app btn-icon btn-app--sm btn-app--outline p-1'>
                                                <RiDeleteBin6Line />
                                            </button>
                                        </div>

                                        <input value={item.name} onChange={(e) => handleChangeName(e, item.id)} className='form-control form-control-sm' id={"name" + index} type="text" placeholder='ví dụ: Màu sắc' />
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        {item.values.map(v => (
                                            <span key={v.id} className='d-inline-block ps-2 bg-neutral-200 f-caption'>
                                                <span>{v.content}</span>
                                                <button onClick={() => handDeleteValue(item.id, v.id)} className='border-0 bg-transparent'>
                                                    <IoClose />
                                                </button>
                                            </span>

                                        ))}
                                    </div>
                                    <div>
                                        <label htmlFor={"value" + index} className='f-body-sm fw-bold'>Giá trị (Nhập & Enter) {index + 1}</label>
                                        <input value={item.value} onChange={(e) => handleChangeValue(e, item.id)} onKeyDown={(e) => handleKeyDown(e, item.id)} className='form-control form-control-sm' id={"value" + index} type="text" placeholder='Nhập giá trị...' />
                                    </div>
                                </div>
                            ))}
                            <button onClick={addItemGroup} className='btn-app btn-app--ghost btn-app-icon border-dashed bg-neutral-100 w-100'>
                                <IoMdAdd />
                                <span>Thêm nhóm phân loại</span>
                            </button>
                        </div>
                        <div className='col-8'></div>
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