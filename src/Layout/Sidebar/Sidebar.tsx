import { NavLink } from "react-router";

const Sidebar = () => {
    const linkClass = ({isActive}: {isActive: boolean}) => 
        `dash-nav-item ${isActive ? "is-active" : ""}`;
  return (
    <div className="p-3 sidebar">
      <div className="d-flex align-items-center gap-2 mb-5">
        <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--neutral-900)" }} />
        <div>
          <div className="fw-semibold">Ecommerce</div>
          <div className="text-muted small">Admin</div>
        </div>
      </div>

      <nav className="dash-nav">
        <NavLink to="/dashboard" className={linkClass}>
          Tổng quan
        </NavLink>
        <NavLink to="/roles" className={linkClass}>
          Quản lí phân quyền
        </NavLink>
        <NavLink to="/functions" className={linkClass}>
          Quản lí chức năng
        </NavLink>
        <NavLink to="/categories" className={linkClass}>
          Quản lí danh mục
        </NavLink>
        <NavLink to="/products" className={linkClass}>
          Quản lí sản phẩm
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          Quản lí đơn hàng
        </NavLink>
      </nav>
    </div>
  )
}

export default Sidebar