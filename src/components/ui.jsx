import { X, Inbox } from 'lucide-react';

export const cx = (...a) => a.filter(Boolean).join(' ');

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  ghost: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
export const Button = ({ variant = 'primary', className, ...p }) => (
  <button
    className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50', VARIANTS[variant], className)}
    {...p}
  />
);

export const Field = ({ label, error, as: As = 'input', children, ...p }) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-slate-700">{label}</span>
    <As className={cx('w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300', error ? 'border-red-400' : 'border-slate-300')} {...p}>
      {children}
    </As>
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const Card = ({ className, ...p }) => <div className={cx('rounded-xl border border-slate-200 bg-white p-4', className)} {...p} />;

const TONES = {
  High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-emerald-100 text-emerald-700',
  Opened: 'bg-slate-100 text-slate-700', 'In Progress': 'bg-blue-100 text-blue-700', Completed: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-red-600 text-white',
};
export const Badge = ({ children }) => (
  <span className={cx('whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', TONES[children])}>{children}</span>
);

export const Stat = ({ label, value, tone = 'text-slate-900' }) => (
  <Card>
    <p className="text-sm text-slate-500">{label}</p>
    <p className={cx('mt-1 text-2xl font-semibold', tone)}>{value}</p>
  </Card>
);

export const Empty = ({ title, text, children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <Inbox className="mx-auto mb-3 text-slate-400" />
    <p className="font-medium">{title}</p>
    <p className="mb-4 mt-1 text-sm text-slate-500">{text}</p>
    {children}
  </div>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
    <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

export const Confirm = ({ text, onYes, onNo }) => (
  <Modal title="Please confirm" onClose={onNo}>
    <p className="text-sm text-slate-600">{text}</p>
    <div className="mt-5 flex justify-end gap-2">
      <Button variant="ghost" onClick={onNo}>Cancel</Button>
      <Button variant="danger" onClick={onYes}>Delete</Button>
    </div>
  </Modal>
);
