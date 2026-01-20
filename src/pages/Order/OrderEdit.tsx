import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
    RiArrowLeftLine,
    RiSave2Line,
    RiEyeLine,
} from "react-icons/ri";
import {
    useGetOrderByIdQuery,
    useUpdateOrderMutation,
} from "../../features/order/order.api";
import Select from "react-select";

type Option = { value: string; label: string };
const ORDER_STATUS_OPTIONS = [
    { value: "PENDING", label: "PENDING" },
    { value: "CONFIRMED", label: "CONFIRMED" },
    { value: "SHIPPING", label: "SHIPPING" },
    { value: "DELIVERED", label: "DELIVERED" },
    { value: "CANCELLED", label: "CANCELLED" },
];

const statusBadgeClass = (s?: string) => {
    switch (s) {
        case "PENDING":
            return "badge text-bg-warning";
        case "CONFIRMED":
            return "badge text-bg-info";
        case "SHIPPING":
            return "badge text-bg-primary";
        case "DELIVERED":
            return "badge text-bg-success";
        case "CANCELLED":
            return "badge text-bg-danger";
        default:
            return "badge text-bg-secondary";
    }
};

const formatMoney = (v: any) => {
    const n = typeof v === "string" ? Number(v) : (v ?? 0);
    if (Number.isNaN(n)) return "-";
    return n.toLocaleString("vi-VN") + " ₫";
};

const OrderEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: order, isLoading, isFetching } = useGetOrderByIdQuery(id!, {
        skip: !id,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const [updateStatus, { isLoading: saving }] = useUpdateOrderMutation();

    // form state
    const [status, setStatus] = useState<string>("");
    const [reason, setReason] = useState<string>("");

    // init form when order loaded
    useEffect(() => {
        if (!order) return;
        setStatus(order.status ?? "PENDING");
        setReason(""); // bạn có thể set mặc định khác nếu muốn
    }, [order]);

    const originalStatus = order?.status ?? "";
    const hasChanges = useMemo(() => {
        if (!order) return false;
        return status !== originalStatus || reason.trim().length > 0;
    }, [order, status, originalStatus, reason]);

    const reasonRequired = status === "CANCELLED";

    const canSubmit = useMemo(() => {
        if (!order) return false;
        if (!status) return false;
        if (reasonRequired && reason.trim().length === 0) return false;
        return hasChanges;
    }, [order, status, reason, reasonRequired, hasChanges]);
    const statusValue =
        ORDER_STATUS_OPTIONS.find((o) => o.value === status) ?? null;
    const onSubmit = async () => {
        if (!id) return;
        if (!canSubmit) return;

        try {
            await updateStatus({
                id,
                body: {
                    status,
                    reason: reason.trim() || undefined,
                },
            }).unwrap();

            toast.success("Cập nhật trạng thái đơn hàng thành công!");
            navigate(`/orders`);
        } catch (e: any) {
            toast.error(e?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container-fluid py-3">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn-app btn-outline-secondary btn-sm btn-app--outline"
                        onClick={() => navigate(-1)}
                    >
                        <RiArrowLeftLine /> Quay lại
                    </button>

                    <div>
                        <div className="h5 mb-0">Sửa đơn hàng</div>
                        <div className="text-muted small">
                            {isFetching ? "Đang tải…" : "Cập nhật trạng thái và lý do (nếu có)."}
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn-app btn-sm"
                        onClick={onSubmit}
                        disabled={!canSubmit || saving}
                    >
                        <RiSave2Line /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="row g-3">
                {/* Form */}
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-semibold">
                            Cập nhật trạng thái
                        </div>

                        <div className="card-body">
                            {isLoading && (
                                <div className="placeholder-glow">
                                    <div className="placeholder col-6 mb-2" />
                                    <div className="placeholder col-12 mb-2" />
                                    <div className="placeholder col-10" />
                                </div>
                            )}

                            {!isLoading && !order && (
                                <div className="text-muted">Không tìm thấy đơn hàng.</div>
                            )}

                            {!isLoading && order && (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="alert alert-light border mb-0">
                                            <div className="d-flex justify-content-between flex-wrap gap-2">
                                                <div>
                                                    <div className="fw-semibold">
                                                        Mã đơn: {order.orderNumber}
                                                    </div>
                                                    <div className="text-muted small">
                                                        User: {order.userId}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="text-muted small mb-1">Trạng thái hiện tại</div>
                                                    <span className={statusBadgeClass(order.status)}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status select */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold">Trạng thái</label>
                                        <Select
                                            options={ORDER_STATUS_OPTIONS}
                                            value={statusValue}
                                            onChange={(opt) => setStatus((opt as Option).value)}
                                            isSearchable={false}
                                            classNamePrefix="react-select"
                                            placeholder="Chọn trạng thái..."
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: 38,
                                                    borderColor: "#dee2e6",
                                                    boxShadow: "none",
                                                    ":hover": { borderColor: "#adb5bd" },
                                                }),
                                            }}
                                        />
                                        <div className="form-text">
                                            Chọn trạng thái mới cho đơn hàng.
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Lý do {reasonRequired ? <span className="text-danger">*</span> : "(tuỳ chọn)"}
                                        </label>
                                        <textarea
                                            className={`form-control ${reasonRequired && reason.trim() === "" ? "is-invalid" : ""}`}
                                            rows={4}
                                            placeholder={
                                                reasonRequired
                                                    ? "Bắt buộc nhập lý do huỷ đơn..."
                                                    : "Nhập lý do thay đổi (nếu cần)..."
                                            }
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                        {reasonRequired && reason.trim() === "" && (
                                            <div className="invalid-feedback">Vui lòng nhập lý do khi huỷ đơn.</div>
                                        )}
                                    </div>

                                    {/* Hint */}
                                    <div className="col-12">
                                        <div className="alert alert-warning mb-0">
                                            <div className="fw-semibold mb-1">Lưu ý</div>
                                            <div className="small">
                                                Việc đổi trạng thái có thể ảnh hưởng đến luồng vận hành (giao hàng, thanh toán).
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card-footer bg-white d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn-app btn-outline-secondary btn-app--outline"
                                onClick={() => navigate(-1)}
                                disabled={saving}
                            >
                                Huỷ
                            </button>
                            <button
                                type="button"
                                className="btn-app btn-primary"
                                onClick={onSubmit}
                                disabled={!canSubmit || saving}
                            >
                                <RiSave2Line /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white fw-semibold">Tóm tắt đơn</div>
                        <div className="card-body">
                            {order ? (
                                <>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tạm tính</span>
                                        <span className="fw-semibold">{formatMoney(order.subTotalAmount)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Giảm giá</span>
                                        <span className="fw-semibold text-danger">
                                            - {formatMoney(order.discountAmount)}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-semibold">Tổng thanh toán</span>
                                        <span className="fw-bold">{formatMoney(order.finalAmount)}</span>
                                    </div>

                                    <hr />
                                    <div className="text-muted small mb-2">Preview trạng thái mới</div>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="text-muted">Sau khi lưu</span>
                                        <span className={statusBadgeClass(status)}>{status || "-"}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted">—</div>
                            )}
                        </div>
                    </div>

                    {order?.orderAddress && (
                        <div className="card shadow-sm mt-3">
                            <div className="card-header bg-white fw-semibold">Địa chỉ</div>
                            <div className="card-body">
                                <div className="fw-semibold">{order.orderAddress.contactName}</div>
                                <div className="text-muted small mb-2">{order.orderAddress.phone}</div>
                                <div className="bg-light border rounded p-2 small">
                                    <div>{order.orderAddress.addressDetail}</div>
                                    <div className="text-muted">
                                        {order.orderAddress.ward}, {order.orderAddress.district}, {order.orderAddress.city}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderEdit;
