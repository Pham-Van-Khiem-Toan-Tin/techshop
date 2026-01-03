import { useParams, useNavigate, Link } from "react-router";
import { RiEditLine } from "react-icons/ri";
import { useGetAttributeByIdQuery } from "../../features/attribute/attribute.api";
import type { AttributeDetail } from "../../types/attribute.type";
import type { Option } from "../../types/select.type";

const AttributeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } =
    useGetAttributeByIdQuery(id as string, {
      skip: !id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="border-app--rounded bg-white p-4" style={{ width: 700 }}>
          Đang tải…
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="border-app--rounded bg-white p-4" style={{ width: 700 }}>
          Không tìm thấy thuộc tính.
        </div>
      </div>
    );
  }
  const isSelect = data.dataType === "SELECT" || data.dataType === "MULTI_SELECT";

  // đổi key theo BE của bạn
  const options: Option[] =
    (data as AttributeDetail)?.options ??
    (data as AttributeDetail)?.options ??
    [];
  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="border-app--rounded bg-white" style={{ width: 700 }}>
        {/* Header giống Create */}
        <div className="d-flex align-items-center justify-content-between py-3 px-4 my-2 border-bottom">
          <div>
            <div className="fw-bold fs-6">Chi tiết thuộc tính</div>
            <div className="f-body-3xs">
              Xem thông tin trường dữ liệu kỹ thuật cho sản phẩm.
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="btn-app btn-app--sm btn-app--ghost"
            >
              Quay lại
            </button>

            <Link
              to={`../edit/${data.id}`}
              className="btn-app btn-app--sm btn-app--default"
            >
              <RiEditLine />
              <span>Sửa</span>
            </Link>
          </div>
        </div>

        {/* Body */}
        <form className="py-3 px-4 mb-5">
          <fieldset disabled>
            <div className="form-app row flex-row gap-0 gy-4">
              <div className="col-6">
                <label className="form-label">
                  Tên hiển thị <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control form-control-sm"
                  value={data.label ?? ""}
                  readOnly
                />
              </div>

              <div className="col-6">
                <label className="form-label">
                  Mã (CODE) <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control form-control-sm"
                  value={data.code ?? ""}
                  readOnly
                />
              </div>

              <div className="col-6">
                <label className="form-label">
                  Đơn vị
                  {data.dataType === "NUMBER" && (
                    <span className="text-danger"> *</span>
                  )}
                </label>
                <input
                  className="form-control form-control-sm"
                  value={
                    data.dataType === "NUMBER" ? (data as any)?.unit ?? "" : ""
                  }
                  readOnly
                />
              </div>

              <div className="col-6">
                <label className="form-label">
                  Kiểu dữ liệu <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control form-control-sm"
                  value={data.dataType ?? ""}
                  readOnly
                />
              </div>

              <div className="col-12" hidden>
                <label className="form-label">ID</label>
                <input
                  className="form-control form-control-sm"
                  value={data.id ?? ""}
                  readOnly
                />
              </div>

              {/* Options */}
              {isSelect && (
                <div className="col-12">
                  <label className="form-label">
                    Danh sách lựa chọn <span className="text-danger">*</span>
                  </label>

                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Value</th>
                        <th style={{ width: "60%" }}>Label</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-muted">
                            Không có lựa chọn nào.
                          </td>
                        </tr>
                      ) : (
                        options.map((opt, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={opt.value}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={opt.label}
                                readOnly
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}

export default AttributeDetail