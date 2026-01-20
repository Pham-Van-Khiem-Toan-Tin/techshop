import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
    useQueryStates,
    parseAsInteger,
    parseAsString,
    parseAsNativeArrayOf,
} from "nuqs";
import type { Column } from '../../types/table.type';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import { RiEditLine, RiEyeLine, RiInformationLine, RiSaveLine } from 'react-icons/ri';
import { FilterIndicator } from "../../components/common/FilterIndicator ";
import { SortIndicator } from "../../components/common/SortIndicator ";
import type { Page } from "../../types/page.type";
import { Link, useNavigate } from 'react-router';
import { useAdjustInventoryMutation, useGetAllInventoriesQuery, useLazyGetInventoryHistoryQuery } from "../../features/inventory/inventory.api";
import type { AdjustForm, AdjustType, Inventory } from "../../types/inventory,type";
import { Modal } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
const SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_SIZE = 10;
const normalizeSize = (raw: number) =>
    (SIZE_OPTIONS as readonly number[]).includes(raw) ? raw : DEFAULT_SIZE;

type Option = { value: string; label: string };
const FIELD_OPTIONS: Option[] = [
    { value: "id", label: "ID" },
    { value: "skuCode", label: "Mã sku" },
];
const SORT_OPTIONS: Option[] = [
    { value: "skuCode:asc", label: "Mã sku A→Z" },
    { value: "skuCode:desc", label: "Mã sku Z→A" },
];
const statusStyle = {
    IN_STOCK: {
        label: "Còn hàng",
        class: "badge bg-info"
    },
    LOW_STOCK: {
        label: "Sắp hết",
        class: "badge bg-warning"
    },
    OUT_OF_STOCK: {
        label: "Hết hàng",
        class: "badge bg-danger"
    },
} as const;

const ADJUST_TYPE_OPTIONS: { value: AdjustType; label: string }[] = [
    { value: "IMPORT", label: "Nhập kho (+)" },
    { value: "EXPORT", label: "Xuất kho (-)" },
    { value: "ADJUST", label: "Điều chỉnh (set tồn thực tế)" },
];
const InventoryManagement = () => {
    const [query, setQuery] = useQueryStates({
        page: parseAsInteger.withDefault(1), // UI 1-based
        size: parseAsInteger.withDefault(DEFAULT_SIZE),
        q: parseAsString.withDefault(""),
        field: parseAsNativeArrayOf(parseAsString).withDefault([]),
        sort: parseAsString.withDefault("skuCode:asc"),
    });
    // normalize page/size từ URL
    const uiPage = Math.max(1, query.page);
    const size = normalizeSize(query.size);
    const page = uiPage - 1; // API 0-based
    useEffect(() => {
        if (query.size !== size) setQuery({ size, page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.size, size]);

    // input box nên là local state để gõ mượt, còn query dùng debounced
    const [keywordInput, setKeywordInput] = useState(query.q);
    const [fieldDraft, setFieldDraft] = useState<string[]>(query.field);
    const [sortDraft, setSortDraft] = useState<string>(query.sort);

    // Khi URL thay đổi (back/forward, share link, v.v.) -> sync draft theo applied
    useEffect(() => setKeywordInput(query.q), [query.q]);
    useEffect(() => setFieldDraft(query.field), [query.field]);
    useEffect(() => setSortDraft(query.sort), [query.sort]);
    const applySearch = () => {
        setQuery({
            q: keywordInput,
            field: fieldDraft,
            sort: sortDraft,
            page: 1, // reset về trang 1 khi search
        });
    };
    const { data, isLoading, isFetching } = useGetAllInventoriesQuery({
        keyword: query.q, // không debounce vì chỉ đổi khi applySearch
        page,
        size,
        fields: query.field,
        sort: query.sort,
    }, { refetchOnFocus: true, refetchOnReconnect: true })
    const rows: Inventory[] = data?.content ?? [];
    const totalPages = Math.max(
        1,
        Math.ceil(((data as Page<Inventory>)?.total ?? 0) / size)
    );
    useEffect(() => {
        if (uiPage > totalPages) setQuery({ page: totalPages });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);
    const columns = useMemo<Column<Inventory>[]>(() =>
        [
            { key: "skuCode", title: "Mã sku", strong: true, render: (r) => r.skuCode },
            {
                key: "totalStock", title: "Tồn kho thực", muted: true, render: (r) => r.totalStock
            },
            {
                key: "reservedStock", title: "Đã giữ", muted: true, render: (r) => r.reservedStock
            },
            {
                key: "availableStock", title: "Khả dụng", muted: true, render: (r) => r.availableStock
            },
            {
                key: "minStockLevel", title: "Ngưỡng cảnh báo", muted: true, render: (r) => r.minStockLevel
            },
            {
                key: "status", title: "Trạng thái", muted: true, render: (r) => <div className={statusStyle[r.status].class}>{statusStyle[r.status].label}</div>
            },
            {
                key: "lowStock", title: "Cảnh báo", muted: true, render: (r) => r.lowStock && (
                    <span className="badge badge-warning">Sắp hết</span>
                )
            },

        ]
        , []);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const toggleRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };
    const toggleAll = (idsOnPage: string[], nextChecked: boolean) => {
        setSelectedIds((prev) => {
            const set = new Set(prev);
            if (nextChecked) idsOnPage.forEach((id) => set.add(id));
            else idsOnPage.forEach((id) => set.delete(id));
            return Array.from(set);
        });
    };
    const fieldValue = FIELD_OPTIONS.filter((o) => fieldDraft.includes(o.value));
    const sortValue =
        SORT_OPTIONS.find((o) => o.value === sortDraft) ?? SORT_OPTIONS[0];

    const hasPendingChanges =
        keywordInput !== query.q ||
        sortDraft !== query.sort ||
        JSON.stringify(fieldDraft) !== JSON.stringify(query.field);
    const navigate = useNavigate();
    const [openModalHistory, setOpenModalHistory] = useState<boolean>(false)
    const closeHistory = () => {
        setOpenModalHistory(false);
    }
    const [openModalAdjust, setOpenModalAdjust] = useState<boolean>(false)
    const closeAdjust = () => {
        setOpenModalAdjust(false);
    };

    const openAdjust = (r: Inventory) => {
        setItemSelected(r);
        setOpenModalAdjust(true);
        reset({
            type: "IMPORT",
            quantity: "",
            note: "",
        });
    };

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<AdjustForm>({
        defaultValues: { type: "IMPORT", quantity: "", note: "" },
    });

    const typeWatch = watch("type");
    const [adjustInventory, { isLoading: isAdjusting }] = useAdjustInventoryMutation();
    const parsePositiveInt = (s: string) => {
        const v = s.replace(/\D+/g, "");
        return v ? Number(v) : 0;
    };
    const onSubmitAdjust = async (values: AdjustForm) => {
        if (!itemSelected?.skuCode) return;

        const qty = parsePositiveInt(values.quantity);
        if (qty <= 0) {
            setError("quantity", { type: "validate", message: "Số lượng phải > 0" });
            return;
        }

        // EXPORT: không cho xuất quá available
        if (values.type === "EXPORT" && qty > itemSelected.availableStock) {
            setError("quantity", {
                type: "validate",
                message: `Không thể xuất quá khả dụng (${itemSelected.availableStock})`,
            });
            return;
        }

        try {
            await adjustInventory({
                skuCode: itemSelected.skuCode,
                type: values.type,
                quantity: qty,
                note: values.note?.trim() || undefined,
            }).unwrap();
            toast.success("Điều chỉnh tồn kho thành công")
            closeAdjust();
        } catch (e) {
            // bạn có thể toast ở đây
            setError("root", { type: "server", message: "Điều chỉnh thất bại. Vui lòng thử lại." });
        }
    };
    const [itemSelected, setItemSelected] = useState<Inventory | null>(null)
    const [getHistory, {
        data: historyPage,
        isFetching: isFetchingHistory,
        isError: isErrorHistory,
        error: historyError,
    },] = useLazyGetInventoryHistoryQuery();

    const handleOpenModalHistory = async (r: Inventory) => {
        setItemSelected(r);
        setOpenModalHistory(true);

        // gọi API lấy lịch sử (page/size tuỳ bạn)
        getHistory({
            skuCode: r.skuCode,
            page: 0,
            size: 10,
        });
    }
    return (
        <div className="container-fluid py-3 d-grid gap-3">
            {/* Search */}
            <div className="table-card">
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <div className="table-card__title form-app mb-0 d-flex flex-row align-items-center gap-2 flex-wrap">
                        {/* keyword */}
                        <input
                            className="form-control form-control-sm"
                            style={{ width: 280 }}
                            placeholder="Tìm kiếm quyền..."
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") applySearch();
                            }}
                        />
                        <button
                            className="btn-app btn-app--sm btn-app--default"
                            onClick={applySearch}
                            disabled={!hasPendingChanges}
                            title={!hasPendingChanges ? "Không có thay đổi" : "Áp dụng tìm kiếm"}
                        >
                            Tìm kiếm
                        </button>

                        {/* multi filter: field */}
                        <div style={{ minWidth: 260 }}>
                            <Select
                                isMulti
                                placeholder="Tìm theo trường..."
                                options={FIELD_OPTIONS}
                                value={fieldValue}
                                onChange={(vals) => {
                                    const next = (vals as Option[]).map((v) => v.value);
                                    setFieldDraft(next); // ✅ chỉ đổi draft
                                }}
                                components={{
                                    DropdownIndicator: FilterIndicator,
                                    IndicatorSeparator: null,
                                }}
                            />
                        </div>

                        {/* sort */}
                        <div style={{ minWidth: 220 }}>
                            <Select
                                placeholder="Sắp xếp..."
                                options={SORT_OPTIONS}
                                value={sortValue}
                                onChange={(val) => {
                                    const v = (val as Option | null)?.value ?? "id:asc";
                                    setSortDraft(v);
                                }}
                                components={{
                                    DropdownIndicator: SortIndicator,
                                    IndicatorSeparator: null,
                                }}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Link to="create" className="btn-app btn-app--sm btn-app--default">
                            Thêm thuộc tính
                        </Link>
                    </div>
                </div>
            </div>

            {/* Table */}
            <DataTable<Inventory>
                title="Danh sách tồn kho"
                description={isFetching ? "Đang tải…" : "Quản lí tồn kho"}
                columns={columns}
                rows={rows}
                loading={isLoading}
                emptyText="Không tìm thấy bản ghi nào."
                selection={{
                    enabled: true,
                    getRowId: (r) => r.id,
                    selectedIds,
                    onToggleRow: toggleRow,
                    onToggleAll: toggleAll,
                    // disabled: (r) => r.status === "INACTIVE" // optional
                }}
                actions={{
                    width: 320,
                    title: "Thao tác",
                    items: [
                        {
                            key: "view", label: <RiInformationLine />, onClick: (r) => handleOpenModalHistory(r)
                        },
                        { key: "edit", label: <RiEditLine />, onClick: (r) => openAdjust(r)},
                    ],
                }}
            />

            {/* Pagination: UI is 1-based, API is 0-based */}
            <div className="table-card">
                <Pagination
                    page={uiPage}
                    totalPages={totalPages}
                    onChange={(nextUiPage) => setQuery({ page: nextUiPage })}
                    variant="basic"
                    totalElement={data?.total}
                    showRowsPerPage
                    rowsPerPage={size}
                    rowsPerPageOptions={[...SIZE_OPTIONS]}
                    onRowsPerPageChange={(v) => setQuery({ size: v, page: 1 })}
                />
            </div>

            {/* Selected summary (optional) */}
            {selectedIds.length > 0 && (
                <div className="table-card">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="fw-semibold">
                            Đã chọn: {selectedIds.length}
                        </div>
                        <button
                            className="action-btn action-btn--danger"
                            type="button"
                            onClick={() => setSelectedIds([])}
                        >
                            Bỏ chọn
                        </button>
                    </div>
                </div>
            )}
            <Modal
                show={openModalHistory}
                onHide={closeHistory}
                centered
                dialogClassName="modal-app"
                backdropClassName="modal-app-backdrop"
            >
                <Modal.Header>
                    <Modal.Title>
                        <span className="fw-bold fs-5">Lịch sử kho</span>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-flex align-items-start justify-content-between gap-2">
                        <div>
                            <div className="fw-semibold">SKU: {itemSelected?.skuCode ?? "-"}</div>
                            <div className="text-muted" style={{ color: "var(--app-text-muted)" }}>
                                Lịch sử nhập / xuất / điều chỉnh
                            </div>
                        </div>

                        {/* optional: nút refresh */}
                        <button
                            type="button"
                            className="btn-app btn-app--sm btn-app--ghost"
                            onClick={() => {
                                if (itemSelected?.skuCode) {
                                    getHistory({ skuCode: itemSelected.skuCode, page: 0, size: 10 });
                                }
                            }}
                            disabled={!itemSelected?.skuCode || isFetchingHistory}
                            title="Tải lại"
                        >
                            <RiEyeLine />
                        </button>
                    </div>

                    <div className="mt-3">
                        {/* Loading */}
                        {isFetchingHistory && (
                            <div className="d-flex align-items-center gap-2 py-3">
                                <div className="spinner-border spinner-border-sm" role="status" />
                                <span>Đang tải dữ liệu...</span>
                            </div>
                        )}

                        {/* Error */}
                        {isErrorHistory && !isFetchingHistory && (
                            <div className="alert alert-danger d-flex align-items-center justify-content-between">
                                <span>Không tải được lịch sử kho.</span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                        if (itemSelected?.skuCode) {
                                            getHistory({ skuCode: itemSelected.skuCode, page: 0, size: 10 });
                                        }
                                    }}
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* Empty */}
                        {!isFetchingHistory && !isErrorHistory && (!historyPage?.content || historyPage.content.length === 0) && (
                            <div className="text-muted py-3">Chưa có lịch sử.</div>
                        )}

                        {/* Table */}
                        {!isFetchingHistory && !isErrorHistory && historyPage && historyPage?.content?.length > 0 && (
                            <div className="table-responsive">
                                <table className="table-app table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th style={{ whiteSpace: "nowrap" }}>Thời gian</th>
                                            <th style={{ whiteSpace: "nowrap" }}>Loại</th>
                                            <th className="text-end" style={{ whiteSpace: "nowrap" }}>Thay đổi</th>
                                            <th className="text-end" style={{ whiteSpace: "nowrap" }}>Tồn sau</th>
                                            <th style={{ whiteSpace: "nowrap" }}>Tham chiếu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyPage?.content.map((h) => (
                                            <tr key={h.id}>
                                                <td style={{ whiteSpace: "nowrap" }}>
                                                    {new Date(h.createdAt).toLocaleString("vi-VN")}
                                                </td>

                                                <td>
                                                    {/* map type -> label đẹp hơn nếu bạn muốn */}
                                                    <span className="badge bg-secondary">{h.type}</span>
                                                </td>

                                                <td className={`text-end ${h.quantityChange > 0 ? "text-success" : "text-danger"}`}>
                                                    {h.quantityChange > 0 ? "+" : ""}
                                                    {h.quantityChange}
                                                </td>

                                                <td className="text-end">{h.stockAfter}</td>

                                                <td>{h.referenceId ?? "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Optional: hiển thị tổng + phân trang nếu backend trả đủ */}
                                <div className="d-flex justify-content-between align-items-center mt-2 text-muted">
                                    <span>
                                        Hiển thị {historyPage?.content.length} bản ghi
                                    </span>
                                    <span>
                                        Tổng: {historyPage?.page?.totalElements ?? "-"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type="button"
                        className="btn-app btn-app--sm btn-app--ghost p-3"
                        onClick={closeHistory}
                        disabled={isFetchingHistory}
                    >
                        Đóng
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={openModalAdjust}
                onHide={closeAdjust}
                centered
                dialogClassName="modal-app"
                backdropClassName="modal-app-backdrop"
            >
                <Modal.Header>
                    <Modal.Title>
                        <span className="fw-bold fs-5">Điều chỉnh kho</span>
                    </Modal.Title>
                </Modal.Header>

                <form onSubmit={handleSubmit(onSubmitAdjust)}>
                    <Modal.Body>
                        <div className="mb-2">
                            <div className="fw-semibold">SKU: {itemSelected?.skuCode ?? "-"}</div>
                            <div className="text-muted" style={{ color: "var(--app-text-muted)" }}>
                                Tồn thực: {itemSelected?.totalStock ?? 0} • Đã giữ: {itemSelected?.reservedStock ?? 0} • Khả dụng:{" "}
                                {itemSelected?.availableStock ?? 0}
                            </div>
                        </div>

                        {/* server error */}
                        {"root" in errors && (errors as any).root?.message && (
                            <div className="alert alert-danger">{(errors as any).root.message}</div>
                        )}

                        {/* Type */}
                        <div className="form-app mb-3">
                            <label className="form-label mb-1">Loại điều chỉnh</label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        options={ADJUST_TYPE_OPTIONS}
                                        value={ADJUST_TYPE_OPTIONS.find((x) => x.value === field.value)}
                                        onChange={(opt) => field.onChange((opt as any)?.value)}
                                        isSearchable={false}
                                    />
                                )}
                            />
                        </div>

                        {/* Quantity */}
                        <div className="form-app mb-3">
                            <label className="form-label mb-1">
                                {typeWatch === "ADJUST" ? "Tồn kho thực tế (set)" : "Số lượng"}
                                <span className="text-danger"> *</span>
                            </label>

                            <input
                                className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                                placeholder={typeWatch === "ADJUST" ? "Nhập tồn thực tế..." : "Nhập số lượng..."}
                                {...register("quantity", {
                                    required: "Vui lòng nhập số lượng",
                                    validate: (v) => parsePositiveInt(v) > 0 || "Số lượng phải > 0",
                                })}
                                onChange={(e) => {
                                    // chỉ cho số
                                    const clean = e.target.value.replace(/\D+/g, "");
                                    e.target.value = clean;
                                }}
                            />

                            {errors.quantity?.message && <div className="invalid-feedback">{errors.quantity.message}</div>}

                            {/* hint */}
                            <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                                {typeWatch === "IMPORT" && "Nhập kho sẽ cộng vào tồn thực."}
                                {typeWatch === "EXPORT" && "Xuất kho sẽ trừ khỏi tồn thực (không vượt quá khả dụng)."}
                                {typeWatch === "ADJUST" && "Điều chỉnh sẽ set tồn thực tế theo kiểm kê."}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="form-app">
                            <label className="form-label mb-1">Ghi chú</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Ví dụ: Nhập hàng NCC A / Hàng hỏng / Kiểm kê cuối ngày..."
                                {...register("note")}
                            />
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn-app btn-app--sm btn-app--ghost p-3"
                            onClick={closeAdjust}
                            disabled={isAdjusting || isSubmitting}
                        >
                            Huỷ
                        </button>
                        <button type="submit" className="btn-app btn-app--sm" disabled={isAdjusting || isSubmitting}>
                            <RiSaveLine />
                            <span className="ms-1">{isAdjusting || isSubmitting ? "Đang lưu..." : "Lưu"}</span>
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    )
}

export default InventoryManagement