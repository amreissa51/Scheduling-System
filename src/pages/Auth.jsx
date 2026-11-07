import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card, Field } from '../components/ui';

const Shell = ({ title, children, foot }) => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold text-indigo-700"><CalendarCheck /> Scheduling System</div>
      <Card className="space-y-4 p-6"><h2 className="text-lg font-semibold">{title}</h2>{children}</Card>
      <p className="mt-4 text-center text-sm text-slate-600">{foot}</p>
    </div>
  </div>
);

export function Login() {
  const { user, login } = useApp();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={`/${user.role}`} replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (!f.email.trim() || !f.password) return setErr('Enter your email and password.');
    setBusy(true);
    setErr((await login(f.email, f.password)) || '');
    setBusy(false);
  };
  return (
    <Shell title="Log in" foot={<>No account? <Link className="font-medium text-indigo-600" to="/register">Register</Link></>}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field type="email" label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field type="password" label="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>Log in</Button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { user, register } = useApp();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', role: 'developer' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={`/${user.role}`} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Full name is required.';
    if (!f.email.trim()) er.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) er.email = 'Enter a valid email address.';
    if (f.password.length < 6) er.password = 'Password must be at least 6 characters.';
    if (f.confirm !== f.password) er.confirm = 'Passwords do not match.';
    if (!Object.keys(er).length) {
      setBusy(true);
      const msg = await register(f);
      setBusy(false);
      if (msg) er.email = msg;
    }
    setErrs(er);
  };
  return (
    <Shell title="Create your account" foot={<>Already registered? <Link className="font-medium text-indigo-600" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Full name" value={f.name} onChange={set('name')} error={errs.name} />
        <Field type="email" label="Email" value={f.email} onChange={set('email')} error={errs.email} />
        <Field type="password" label="Password" value={f.password} onChange={set('password')} error={errs.password} />
        <Field type="password" label="Confirm password" value={f.confirm} onChange={set('confirm')} error={errs.confirm} />
        <Field as="select" label="Role" value={f.role} onChange={set('role')}>
          <option value="developer">Developer</option>
          <option value="manager">Project Manager</option>
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>Create account</Button>
      </form>
    </Shell>
  );
}
