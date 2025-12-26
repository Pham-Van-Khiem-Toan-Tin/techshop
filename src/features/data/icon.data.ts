import {
    RiDashboardLine,
    RiUserLine,
    RiUserSettingsLine,
    RiLockLine,

    RiSettings3Line,
    RiEqualizerLine,
    RiToolsLine,

    RiShoppingCartLine,
    RiBankCardLine,
    RiBox3Line,
    RiFolderLine,

    RiBarChartLine,
    RiPieChartLine,
    RiLineChartLine,

    RiNotification3Line,
    RiMailLine,

    RiFileListLine,
    RiSearchLine,
    RiHistoryLine,

    RiDatabase2Line,
    RiCloudLine,
    RiGitPullRequestLine,
    RiPriceTag3Line,
    RiShieldLine,
    RiStackLine,
    RiShape2Line,

} from "react-icons/ri"
export type IconOption = {
    value: string
    label: string
    Icon: React.ComponentType<{ size?: number }>
}
export const optionIcons: IconOption[] = [
    // ===== CORE =====
    { value: "RiDashboardLine", label: "Tổng quan", Icon: RiDashboardLine },
    { value: "RiUserLine", label: "Người dùng", Icon: RiUserLine },
    { value: "RiUserSettingsLine", label: "Cài đặt người dùng", Icon: RiUserSettingsLine },
    { value: "RiShieldLine", label: "Vai trò", Icon: RiShieldLine },
    { value: "RiStackLine", label: "Chức năng", Icon: RiStackLine },
    { value: "RiGitPullRequestLine", label: "Quyền hạn", Icon: RiGitPullRequestLine },
    { value: "RiLockLine", label: "Bảo mật", Icon: RiLockLine },

    // ===== SYSTEM =====
    { value: "RiSettings3Line", label: "Cài đặt", Icon: RiSettings3Line },
    { value: "RiEqualizerLine", label: "Cấu hình", Icon: RiEqualizerLine },
    { value: "RiToolsLine", label: "Công cụ hệ thống", Icon: RiToolsLine },

    // ===== BUSINESS =====
    { value: "RiShoppingCartLine", label: "Đơn hàng", Icon: RiShoppingCartLine },
    { value: "RiBankCardLine", label: "Thanh toán", Icon: RiBankCardLine },
    { value: "RiBox3Line", label: "Sản phẩm", Icon: RiBox3Line },
    { value: "RiFolderLine", label: "Danh mục", Icon: RiFolderLine },
    { value: "RiPriceTag3Line", label: "Thuộc tính", Icon: RiPriceTag3Line },
    { value: "RiShape2Line", label: "Bộ Thuộc tính", Icon: RiShape2Line },

    // ===== REPORT =====
    { value: "RiBarChartLine", label: "Báo cáo", Icon: RiBarChartLine },
    { value: "RiPieChartLine", label: "Phân tích", Icon: RiPieChartLine },
    { value: "RiLineChartLine", label: "Thống kê", Icon: RiLineChartLine },

    // ===== NOTIFICATION =====
    { value: "RiNotification3Line", label: "Thông báo", Icon: RiNotification3Line },
    { value: "RiMailLine", label: "Email", Icon: RiMailLine },

    // ===== AUDIT / LOG =====
    { value: "RiFileListLine", label: "Log", Icon: RiFileListLine },
    { value: "RiSearchLine", label: "Audit", Icon: RiSearchLine },
    { value: "RiHistoryLine", label: "Lịch sử", Icon: RiHistoryLine },

    // ===== INFRA =====
    { value: "RiDatabase2Line", label: "Database", Icon: RiDatabase2Line },
    { value: "RiCloudLine", label: "Cloud", Icon: RiCloudLine },
]