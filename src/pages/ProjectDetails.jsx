import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Copy, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Empty } from '../components/ui';
import { percentDone, range } from '../utils/scheduling';
import TaskForm from '../components/TaskForm';

export default function ProjectDetails() {
  const { id } = useParams();
  const { myProjects, myTasks, users, notify, userName } = useApp();
  const [adding, setAdding] = useState(false);
  const p = myProjects.find((x) => x.id === id);
  if (!p) return <Navigate to="/manager/projects" replace />;
  const tasks = myTasks.filter((t) => t.projectId === p.id);
  const members = users.filter((u) => p.memberIds.includes(u.id));
  const copy = () => navigator.clipboard?.writeText(p.joinCode).then(() => notify('Join code copied.'), () => notify('Copy failed. Select the code manually.', 'error')) ?? notify('Copy is not available in this browser.', 'error');
  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h2 className="text-xl font-semibold">{p.name}</h2>
        <p className="text-sm text-slate-600">{p.description || 'No description.'}</p>
        <p className="text-sm text-slate-500">{p.startDate} to {p.deadline} · {percentDone(tasks)}% complete</p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <span className="text-slate-600">Join code:</span>
          <code className="rounded bg-slate-100 px-2 py-1 text-base font-semibold tracking-widest">{p.joinCode}</code>
          <Button variant="ghost" onClick={copy}><Copy size={14} /> Copy</Button>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 font-semibold">Developers ({members.length})</h3>
          {members.length === 0 ? <p className="text-sm text-slate-500">No one has joined yet. Share the join code above.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {members.map((u) => <li key={u.id} className="py-2"><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{u.email} · {tasks.filter((t) => t.assigneeId === u.id).length} task(s)</p></li>)}
            </ul>
          )}
        </Card>
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Tasks ({tasks.length})</h3><Button onClick={() => setAdding(true)}><Plus size={16} /> Add task</Button></div>
          {tasks.length === 0 ? <Empty title="No tasks yet" text="Add a task and assign it to a developer who has joined." /> : (
            <Card><ul className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span><span className="font-medium">{t.title}</span><span className="block text-xs text-slate-500">{userName(t.assigneeId)} · {range(t)}</span></span>
                  <span className="flex gap-1"><Badge>{t.priority}</Badge><Badge>{t.status}</Badge></span>
                </li>
              ))}
            </ul></Card>
          )}
          <Link to="/manager/calendar" className="text-sm font-medium text-indigo-600">Open team calendar</Link>
        </div>
      </div>
      {adding && <TaskForm projectId={p.id} onClose={() => setAdding(false)} />}
    </div>
  );
}
