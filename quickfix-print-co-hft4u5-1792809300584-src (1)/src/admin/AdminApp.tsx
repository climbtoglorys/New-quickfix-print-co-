import { useState, type FormEvent } from 'react';
import { Link, navigate, type Route } from '../lib/router';
import { useAuth } from '../lib/auth';
import { Wordmark, useMeta } from '../components/Layout';
import { Spinner } from '../components/ui';
import AdminProducts from './AdminProducts';
import AdminShowcase from './AdminShowcase';
import AdminEnquiries from './AdminEnquiries';
import { Inbox, LogOut, Package, Users, Briefcase } from 'lucide-react';

function LoginView() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    const result = await auth.signIn(email, password);
    setBusy(false);
    if (result) setError(result);
  };

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setBusy(true);
    const result = await auth.sendReset(email);
    setBusy(false);
    if (result) setError(result);
    else
      setInfo(
        'If that email belongs to an administrator account, a password reset link has been sent.'
      );
  };

  return (
    <div className="admin-center">
      <div className="login-card">
        <Link
          to=""
          className="brand-link"
          aria-label="Back to the Quickfix Print & Co website"
        >
          <Wordmark />
        </Link>
        <h1>{mode === 'login' ? 'Admin sign in' : 'Reset your password'}</h1>
        <p className="muted">
          Staff area. Only approved administrator accounts can sign in.
        </p>

        {error && (
          <div className="notice notice-error" role="alert">
            <span>{error}</span>
          </div>
        )}
        {info && (
          <div className="notice notice-success" role="status">
            <span>{info}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={onLogin} noValidate>
            <div className="field">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setMode('forgot');
                setError(null);
              }}
            >
              Forgot your password?
            </button>
          </form>
        ) : (
          <form onSubmit={onForgot} noValidate>
            <div className="field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {busy ? 'Sending...' : 'Send reset link'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setMode('login');
                setError(null);
                setInfo(null);
              }}
            >
              Back to sign in
            </button>
          </form>
        )}
        <Link to="" className="back-link">
          &larr; Back to the website
        </Link>
      </div>
    </div>
  );
}

function ResetView() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status === 'signed-out') {
    return (
      <div className="admin-center">
        <div className="login-card">
          <h1>Reset link not valid</h1>
          <p className="muted">
            This reset link has expired or was opened in a different browser.
            Request a new one from the sign-in page.
          </p>
          <Link to="admin" className="btn btn-primary btn-block">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    const result = await auth.updatePassword(password);
    setBusy(false);
    if (result) setError(result);
    else navigate('admin');
  };

  return (
    <div className="admin-center">
      <div className="login-card">
        <h1>Choose a new password</h1>
        {error && (
          <div className="notice notice-error" role="alert">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
          >
            {busy ? 'Saving...' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotAuthorised() {
  const auth = useAuth();
  return (
    <div className="admin-center">
      <div className="login-card">
        <h1>Not authorised</h1>
        <p className="muted">
          {auth.email ? `${auth.email} is` : 'This account is'} signed in but is
          not an approved administrator, so it cannot manage the website.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => auth.signOut()}
        >
          Sign out
        </button>
        <Link to="" className="back-link">
          &larr; Back to the website
        </Link>
      </div>
    </div>
  );
}

const TABS = [
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/works', label: 'Works', icon: Briefcase },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
];

function AdminShell({ route }: { route: Route }) {
  const auth = useAuth();
  const path = route.path === '/admin' ? '/admin/products' : route.path;

  let content;
  if (path === '/admin/works')
    content = <AdminShowcase key="work" kind="work" />;
  else if (path === '/admin/clients')
    content = <AdminShowcase key="client" kind="client" />;
  else if (path === '/admin/enquiries') content = <AdminEnquiries />;
  else content = <AdminProducts />;

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <div className="container admin-bar-row">
          <div className="admin-brand">
            <Wordmark light />
            <span className="admin-tag">Admin</span>
          </div>
          <div className="admin-user">
            <span className="admin-email" title={auth.email ?? undefined}>
              {auth.email}
            </span>
            <Link to="" className="btn btn-ghost btn-sm">
              View site
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => auth.signOut()}
            >
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
        <nav className="container admin-tabs" aria-label="Admin sections">
          {TABS.map(t => {
            const Icon = t.icon;
            const current = path === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={current ? 'admin-tab is-active' : 'admin-tab'}
                aria-current={current ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" /> {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="container admin-main">
        <div className="page-enter" key={path}>
          {content}
        </div>
      </main>
    </div>
  );
}

export default function AdminApp({ route }: { route: Route }) {
  const auth = useAuth();
  useMeta(
    'Admin | Quickfix Print & Co',
    'Staff area for managing the Quickfix Print & Co website.',
    { noindex: true }
  );

  if (auth.status === 'loading') {
    return (
      <div className="admin-center">
        <Spinner label="Checking your session" />
      </div>
    );
  }
  if (route.path === '/admin/reset') return <ResetView />;
  if (auth.status === 'signed-out') return <LoginView />;
  if (auth.status === 'not-admin') return <NotAuthorised />;
  return <AdminShell route={route} />;
}
