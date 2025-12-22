import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { RiSave3Line } from 'react-icons/ri'
import AccordionSelect from '../../components/common/AccordionSelect'

type RoleInput = {
  Id: string,
  name: string,
  description: string
}

const RoleCreate = () => {
  const {
    register,
    formState: { errors },
    handleSubmit

  } = useForm<RoleInput>();
  const onSubmit: SubmitHandler<RoleInput> = (data: RoleInput) => console.log(data);

  return (
    <div className='p-2 border-app--rounded bg-surface'>
      <div className='d-flex align-items-center justify-content-end my-2'>
        <button className='btn-app btn-app btn-app--sm btn-app--default'>
          <RiSave3Line />
          <span>Lưu</span>
        </button>
      </div>
      <Row className='g-4'>
        <Col lg={4}>
          <form onSubmit={handleSubmit(onSubmit)} className='form-app p-2'>
            <div>
              <label htmlFor="ID">ID: <span className="text-danger">*</span></label>
              <input {...register("Id", {
                required: {
                  value: true,
                  message: "Id không được để trống."
                }
              })} type="text" id='ID' className='form-control' placeholder='ROLE_EXAMPLE...' />
              {errors.Id && <span className='text-danger fs-6'>{errors.Id?.message}</span>}
            </div>
            <div>
              <label htmlFor="name">Tên: <span className="text-danger">*</span></label>
              <input {...register("name", {
                required: {
                  value: true,
                  message: "Tên không được để trống."
                }
              })} type="text" id='name' className='form-control' placeholder='Name...' />
              {errors.name && <span className='text-danger fs-6'>{errors.name?.message}</span>}
            </div>
            <div>
              <label htmlFor="description">Mô tả: <span className="text-danger">*</span></label>
              <input {...register("description", {
                required: {
                  value: true,
                  message: "Mô tả không được để trống."
                }
              })} type="text" id='description' className='form-control' placeholder='Description...' />
              {errors.description && <span className='text-danger fs-6'>{errors.description?.message}</span>}
            </div>
          </form>
        </Col>
        <Col>
          <div className='d-flex align-items-center justify-content-between'>
            <span className='f-section'>Cấu hình quyền</span>
            <span className='f-micro'>Chọn các chức năng mà vai trò này có thể truy cập.</span>
          </div>
          <div className='d-flex flex-column gap-2'>
            <AccordionSelect />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default RoleCreate