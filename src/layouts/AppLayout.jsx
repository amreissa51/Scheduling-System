import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarCheck, CalendarDays, FolderKanban, KeyRound, LayoutDashboard, ListChecks, LogOut, Menu, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, cx } from '../components/ui';

const NAV = {
  manager: [['', 'Dashboard', LayoutDashboard], ['projects', 'Projects', FolderKanban], ['tasks', 'Tasks', ListChecks], ['calendar', 'Team Calendar', CalendarDays], ['schedule', 'Developer Schedule', Users]],
  developer: [['', 'Dashboard', LayoutDashboard], ['projects', 'My Projects', FolderKanban], ['join', 'Join Project', KeyRound], ['tasks', 'My Tasks', ListChecks], ['calendar', 'My Calendar', CalendarDays]],
};

export default function AppLayout() {
  const { user, logout } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const nav = NAV[user.role];
  const seg = pathname.split('/').slice(2);
  const title = seg.length > 1 ? (seg[0] === 'projects' ? 'Project Details' : 'Task Details') : nav.find((n) => n[0] === (seg[0] || ''))?.[1] || 'Scheduling System';
  useEffect(() => { document.title = `${title} | Scheduling System`; setOpen(false); }, [title, pathname]);

  return (
    <div className="flex min-h-screen">
      {open && <div className="fixed inset-0 z-20 bg-slate-900/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={cx('fixed inset-y-0 left-0 z-30 w-60 border-r border-slate-200 bg-white p-4 transition-transform md:static md:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="mb-6 flex items-center gap-2 font-semibold text-indigo-700"><CalendarCheck /> Scheduling System</div>
        <nav className="space-y-1">
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} end={path === ''} to={`/${user.role}${path && '/' + path}`}
              className={({ isActive }) => cx('flex items-center gap-2 rounded-lg px-3 py-2 text-sm', isActive ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50')}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-right sm:block"><span className="block font-medium">{user.name}</span><span className="block text-xs capitalize text-slate-500">{user.role === 'manager' ? 'Project Manager' : 'Developer'}</span></span>
            <Button variant="ghost" onClick={logout}><LogOut size={16} /> Log out</Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
