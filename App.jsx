import { useEffect, useState } from "react";
import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, LockKeyhole, Mail, UserRound, LogOut, Activity, CircleCheck } from "lucide-react";
import { api } from "./api";

function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark"><ShieldCheck size={20} /></span>
      <span>northstar<span className="brand-dot">.</span></span>
    </Link>
  );
}

function AuthLayout({ children, mode }) {
  return (
    <main className="page-shell">
      <nav className="topbar"><Brand /><span className="secure-label"><LockKeyhole size={14} /> SECURE ACCESS</span></nav>
      <section className="auth-grid">
        <div className="intro-panel">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR SPACE, SECURED</div>
          <h1>Make room for<br /><span>what matters.</span></h1>
          <p className="intro-copy">A simple, secure place to manage your account and get straight to work.</p>
          <div className="trust-row">
            <span className="trust-icon"><ShieldCheck size={17} /></span>
            <div><strong>Security built in</strong><small>Your password is securely hashed. Your session stays private.</small></div>
          </div>
          <div className="decor-orbit orbit-one" /><div className="decor-orbit orbit-two" />
        </div>
        <div className="form-panel">
          {children}
          <div className="panel-footer"><span>Protected by Northstar</span><span>© 2026</span></div>
        </div>
      </section>
      <footer className="site-footer"><span>Designed for focus.</span><span>{mode === "login" ? "New here? Create an account." : "Already have an account? Sign in."}</span></footer>
    </main>
  );
}

function AuthForm({ mode, onAuthenticated }) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = isRegister
        ? await api.register({ name, email, password })
        : await api.login({ email, password });
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout mode={mode}>
      <div className="form-heading">
        <div className="form-icon"><LockKeyhole size={21} /></div>
        <div className="eyebrow">{isRegister ? "GET STARTED" : "WELCOME BACK"}</div>
        <h2>{isRegister ? "Create your account" : "Sign in to Northstar"}</h2>
        <p>{isRegister ? "Set up your account in less than a minute." : "Enter your details to access your workspace."}</p>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" minLength="2" maxLength="60" required /></div></label>}
        <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></label>
        <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} maxLength="72" required /><button type="button" className="show-password" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        {error && <div className="error-message" role="alert">{error}</div>}
        <button className="primary-button" disabled={loading}>{loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
      </form>
      <div className="switch-auth">{isRegister ? "Already have an account?" : "Don't have an account?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create account"}</Link></div>
      <div className="security-note"><ShieldCheck size={15} /> Your credentials are encrypted in transit and passwords are never stored as plain text.</div>
    </AuthLayout>
  );
}

function Dashboard({ user, onLogout }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.overview().then(setOverview).catch(err => setError(err.message));
  }, []);

  return (
    <main className="dashboard-shell">
      <nav className="dashboard-nav"><Brand /><div className="user-menu"><span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span><span className="user-name">{user.name}</span><button className="logout-button" onClick={onLogout}><LogOut size={16} /> Sign out</button></div></nav>
      <section className="dashboard-content">
        <div className="dashboard-kicker"><span className="status-dot" /> PRIVATE WORKSPACE</div>
        <h1>Good to see you, {user.name.split(" ")[0]}.</h1>
        <p className="dashboard-subtitle">You are signed in. This page is protected by server-side authentication.</p>
        <div className="welcome-card">
          <div className="welcome-card-icon"><CircleCheck size={24} /></div>
          <div><h2>Authentication successful</h2><p>Your session is active and your account is ready.</p></div>
          <span className="active-pill">ACTIVE</span>
        </div>
        <div className="section-title"><Activity size={17} /> ACCOUNT OVERVIEW</div>
        <div className="stat-grid">
          {(overview?.stats || [{label:"Account status",value:"Loading..."},{label:"Authentication",value:"Loading..."},{label:"Session",value:"Loading..."}]).map(item => <div className="stat-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="profile-card"><div><span className="profile-label">ACCOUNT EMAIL</span><strong>{user.email}</strong></div><div><span className="profile-label">MEMBER SINCE</span><strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</strong></div></div>
      </section>
      <footer className="dashboard-footer">Northstar account portal <span>Private · Secure · Personal</span></footer>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.me().then(data => setUser(data.user)).catch(() => setUser(null)).finally(() => setChecking(false));
  }, []);

  async function logout() {
    try { await api.logout(); } finally { setUser(null); navigate("/login"); }
  }

  if (checking) return <div className="loading-screen"><span className="loader" /> Checking your session...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="login" onAuthenticated={u => { setUser(u); navigate("/dashboard"); }} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="register" onAuthenticated={u => { setUser(u); navigate("/dashboard"); }} />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
