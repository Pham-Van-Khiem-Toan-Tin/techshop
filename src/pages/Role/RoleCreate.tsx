import React, { useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { RiSave3Line } from 'react-icons/ri'
import AccordionSelect, { type Section } from '../../components/common/AccordionSelect'
import { useGetAllFunctionsQuery } from '../../features/functions/function.api'
import { toSection, type FunctionEntity } from '../../types/function.type'
import { Link } from 'react-router'

type RoleInput = {
  Id: string,
  name: string,
  description: string
}
const RoleCreate = () => {
  const {
    data: functions,
    isLoading,
    isError,
    error
  } = useGetAllFunctionsQuery(null);
  // console.log(fucntions);

  const [selected, setSelected] = useState<string[]>([]);
  const {
    register,
    formState: { errors },
    handleSubmit

  } = useForm<RoleInput>();

  const sections: Section[] = useMemo(
    () => toSection(functions),
    [functions]
  )

  const onSubmit: SubmitHandler<RoleInput> = (data: RoleInput) => console.log(data);

  return (
    <div className='p-2 border-app--rounded bg-surface'>
      <div className='d-flex align-items-center justify-content-end my-2'>
        <div className='d-flex align-items-center gap-2'>
        <Link to="/roles" className='btn-app btn-app--sm btn-app--ghost' >Hủy</Link>
        <button type='submit' form='role-form' className='btn-app btn-app btn-app--sm btn-app--default'>
          <RiSave3Line />
          <span>Lưu</span>
        </button>
        </div>
      </div>
      <Row className='g-4'>
        <Col lg={4}>
          <form id="role-form" onSubmit={handleSubmit(onSubmit)} className='form-app p-2'>
            <div>
              <label htmlFor="ID">ID: <span className="text-danger">*</span></label>
              <input {...register("Id", {
                required: {
                  value: true,
                  message: "Id không được để trống."
                }
              })} type="text" id='ID' className='form-control form-control-sm' placeholder='ROLE_EXAMPLE...' />
              {errors.Id && <span className='form-message-error'>{errors.Id?.message}</span>}
            </div>
            <div>
              <label htmlFor="name">Tên: <span className="text-danger">*</span></label>
              <input {...register("name", {
                required: {
                  value: true,
                  message: "Tên không được để trống."
                }
              })} type="text" id='name' className='form-control form-control-sm' placeholder='Name...' />
              {errors.name && <span className='form-message-error'>{errors.name?.message}</span>}
            </div>
            <div>
              <label htmlFor="description">Mô tả: <span className="text-danger">*</span></label>
              <textarea {...register("description", {
                required: {
                  value: true,
                  message: "Mô tả không được để trống."
                }
              })} id='description' className='form-control' placeholder='Nhập thông tin mô tả...' />
              {errors.description && <span className='form-message-error'>{errors.description?.message}</span>}
            </div>
          </form>
          <div className='border-app--rounded bg-neutral-100 p-2 m-2'>
            <div className='f-medium'>Tổng kết</div>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='f-body-2xs'>Các quyền được chọn:</span>
              <span className='d-inline-block bg-white py-1 px-2 app--radius f-body-xs' >0</span>
            </div>
          </div>
        </Col>
        <Col>
          <div className='d-flex align-items-center justify-content-between'>
            <span className='f-section'>Cấu hình quyền</span>
            <span className='f-micro'>Chọn các chức năng mà vai trò này có thể truy cập.</span>
          </div>
          <div className='d-flex flex-column gap-2'>
            <AccordionSelect
              sections={sections}
              value={selected}
              onChange={setSelected}
            />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default RoleCreate