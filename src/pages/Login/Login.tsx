import "./login.scss"
const Login = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo" />
          <div>
            <div className="login-title">Admin Dashboard</div>
            <div className="login-subtitle">Sign in to continue</div>
          </div>
        </div>

        {/* Content */}
        <div className="login-content">
          <p className="login-desc">
            This dashboard is restricted. Please sign in with your organization
            account to continue.
          </p>

          <a href="http://localhost:8082/auth/oauth2/authorization/admin-idp" className="btn-app btn-app--default w-100 login-btn">
            Sign in with SSO
          </a>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>© {new Date().getFullYear()} Ecommerce Platform</span>
        </div>
      </div>
    </div>
  )
}

export default Login