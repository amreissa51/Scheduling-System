import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Modal, cx } from './ui';
import { isOverdue, isUpcoming, range, today } from '../utils/scheduling';

const CHIP = { High: 'bg-red-100 text-red-800', Medium: 'bg-amber-100 text-amber-800', Low: 'bg-emerald-100 text-emerald-800' };
const pad = (n) => String(n).padStart(2, '0');

export default function Calendar({ tasks }) {
  const { userName, projectName } = useApp();
  const d0 = new Date();
  const [cur, setCur] = useState({ y: d0.getFullYear(), m: d0.getMonth() });
  const [sel, setSel] = useState(null);
  const lead = new Date(cur.y, cur.m, 1).getDay();
  const total = new Date(cur.y, cur.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const key = (d) => `${cur.y}-${pad(cur.m + 1)}-${pad(d)}`;
  const move = (n) => { const d = new Date(cur.y, cur.m + n, 1); setCur({ y: d.getFullYear(), m: d.getMonth() }); };
  const upcoming = tasks.filter((t) => isUpcoming(t, 60)).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 6);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{new Date(cur.y, cur.m, 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft size={16} /></Button>
            <Button variant="ghost" onClick={() => setCur({ y: d0.getFullYear(), m: d0.getMonth() })}>Today</Button>
            <Button variant="ghost" aria-label="Next month" onClick={() => move(1)}><ChevronRight size={16} /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-lg bg-slate-200 text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="bg-slate-50 p-1.5 text-center font-medium text-slate-500">{d}</div>)}
            {cells.map((d, i) => {
              const items = d ? tasks.filter((t) => t.startDate <= key(d) && key(d) <= t.deadline) : [];
              return (
                <div key={i} className={cx('min-h-[88px] bg-white p-1', !d && 'bg-slate-50')}>
                  {d && <span className={cx('inline-block rounded-full px-1.5', key(d) === today() && 'bg-indigo-600 text-white')}>{d}</span>}
                  {items.slice(0, 3).map((t) => (
                    <button key={t.id} onClick={() => setSel(t)} title={t.title}
                      className={cx('mt-0.5 block w-full truncate rounded px-1 text-left', CHIP[t.priority], t.status === 'Completed' && 'line-through opacity-60', t.status === 'In Progress' && 'border-l-2 border-blue-600')}>
                      {t.title}
                    </button>
                  ))}
                  {items.length > 3 && <p className="mt-0.5 text-slate-500">+{items.length - 3} more</p>}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Colors show priority. Blue edge = in progress. Strikethrough = completed.</p>
      </Card>
      <Card>
        <h3 className="mb-2 font-semibold">Upcoming tasks</h3>
        {upcoming.length === 0 ? <p className="text-sm text-slate-500">No upcoming deadlines.</p> : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <button className="text-left hover:underline" onClick={() => setSel(t)}>{t.title}</button>
                <span className="text-slate-500">Due {t.deadline}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {sel && (
        <Modal title={sel.title} onClose={() => setSel(null)}>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">{sel.description || 'No description.'}</p>
            <p><b>Project:</b> {projectName(sel.projectId)}</p>
            <p><b>Assigned to:</b> {userName(sel.assigneeId)}</p>
            <p><b>Schedule:</b> {range(sel)}</p>
            <div className="flex gap-2"><Badge>{sel.priority}</Badge><Badge>{sel.status}</Badge>{isOverdue(sel) && <Badge>Overdue</Badge>}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
