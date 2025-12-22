import { useMemo, useState } from 'react'
import { useGetRolesQuery } from '../../features/roles/role.api';
import type { Role } from '../../types/role.type';
import type { Column } from '../../types/table.type';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import { RiDeleteBin6Line, RiEditLine, RiEyeLine } from 'react-icons/ri';
import { useDebounce } from '../../hooks/useDebounce';
import { Link } from 'react-router';
const RoleManagement = () => {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedKeyword = useDebounce(keyword, 400)
  const { data,
    isLoading,
    isFetching,
    refetch, } = useGetRolesQuery(
      {
        keyword: debouncedKeyword,
        page,
        size
      },
      {
        refetchOnFocus: true,
        refetchOnReconnect: true,
      }
    )
  const rows: Role[] = data?.content ?? [];
  const totalPages: number = data?.totalPages ?? Math.ceil((data?.totalElements ?? 0) / size) ?? 1;

  const columns = useMemo<Column<Role>[]>(() =>
    [
      { key: "id", title: "ID", muted: true, render: (r) => r.id },
      { key: "name", title: "Tên", strong: true, render: (r) => r.name },
      { key: "description", title: "Mô tả", muted: true, render: (r) => r.description },
      { key: "quantityPermission", title: "Số lượng quyền hạn", muted: true, render: (r) => r.quantityPermission },
    ]
    , [])
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAll = (idsOnPage: string[], nextChecked: boolean) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (nextChecked) idsOnPage.forEach((id) => set.add(id));
      else idsOnPage.forEach((id) => set.delete(id));
      return Array.from(set);
    });
  };
  return (
    <div className="container-fluid py-3 d-grid gap-3">
      {/* Search */}
      <div className="table-card">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="table-card__title form-app mb-0 d-flex align-items-center gap-2">
            <input
              className="form-control form-control-sm"
              style={{ width: 280 }}
              placeholder="Tìm kiếm quyền..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0); // reset page when searching
              }}
            />
            <button className='btn-app btn-app--sm btn-app--default'>Tìm kiếm</button>

          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="create" className='btn-app btn-app--sm btn-app--default'>Thêm quyền</Link>


          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable<Role>
        title="Role list"
        description={isFetching ? "Refreshing…" : "Quản lí quyền"}
        columns={columns}
        rows={rows}
        loading={isLoading}
        emptyText="No roles found."
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
          items: [
            { key: "view", label: <RiEyeLine />, onClick: (r) => console.log("view", r.id) },
            { key: "edit", label: <RiEditLine />, onClick: (r) => console.log("edit", r.id) },
            {
              key: "delete",
              label: <RiDeleteBin6Line />,
              tone: "danger",
              onClick: (r) => {
                if (window.confirm(`Delete role "${r.name}"?`)) {
                  console.log("delete", r.id);
                }
              },
            },
          ],
        }}
      />

      {/* Pagination: UI is 1-based, API is 0-based */}
      <div className="table-card">
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          onChange={(uiPage) => setPage(uiPage - 1)}
          variant="basic"
          showRowsPerPage
          rowsPerPage={size}
          onRowsPerPageChange={(v) => {
            setSize(v);
            setPage(0);
          }}
        />
      </div>

      {/* Selected summary (optional) */}
      {selectedIds.length > 0 && (
        <div className="table-card">
          <div className="d-flex align-items-center justify-content-between">
            <div className="fw-semibold">
              Selected: {selectedIds.length}
            </div>
            <button
              className="action-btn action-btn--danger"
              type="button"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagement