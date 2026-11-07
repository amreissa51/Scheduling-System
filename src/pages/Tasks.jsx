import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Confirm, Empty, Field } from '../components/ui';
import { STATUSES, PRIORITIES, isOverdue, isUpcoming, range } from '../utils/scheduling';
import TaskForm from '../components/TaskForm';

const Filter = ({ label, value, onChange, options }) => (
  <Field as="select" label={label} value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">All</option>
    {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}
  </Field>
);

export default function Tasks() {
  const { user, myProjects, myTasks, users, projectName, userName, deleteTask, setStatus, notify } = useApp();
  const isM = user.role === 'manager';
  const [flt, setFlt] = useState({ project: '', dev: '', status: '', priority: '', due: '' });
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const set = (k) => (v) => setFlt({ ...flt, [k]: v });
  const devs = users.filter((u) => myProjects.some((p) => p.memberIds.includes(u.id)) && u.role === 'developer');
  const rows = myTasks
    .filter((t) =>
      (!flt.project || t.projectId === flt.project) && (!flt.dev || t.assigneeId === flt.dev) &&
      (!flt.status || t.status === flt.status) && (!flt.priority || t.priority === flt.priority) &&
      (!flt.due || (flt.due === 'overdue' ? isOverdue(t) : isUpcoming(t, 7)))
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div className="space-y-4">
      {isM && <div className="flex justify-end"><Button disabled={!myProjects.length} onClick={() => setForm({})}><Plus size={16} /> New task</Button></div>}
      <Card className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Filter label="Project" value={flt.project} onChange={set('project')} options={myProjects.map((p) => [p.id, p.name])} />
        {isM && <Filter label="Developer" value={flt.dev} onChange={set('dev')} options={devs.map((u) => [u.id, u.name])} />}
        <Filter label="Status" value={flt.status} onChange={set('status')} options={STATUSES} />
        <Filter label="Priority" value={flt.priority} onChange={set('priority')} options={PRIORITIES} />
        <Filter label="Deadline" value={flt.due} onChange={set('due')} options={[['overdue', 'Overdue'], ['week', 'Next 7 days']]} />
      </Card>
      {rows.length === 0 ? (
        <Empty title={myTasks.length ? 'No tasks match these filters' : 'No tasks yet'} text={isM ? (myProjects.length ? 'Create a task to get started.' : 'Create a project first, then add tasks.') : 'Tasks assigned to you will appear here.'} />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>{['Task', 'Project', ...(isM ? ['Developer'] : []), 'Schedule', 'Priority', 'Status', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 font-medium">{isM ? t.title : <Link className="hover:underline" to={`/developer/tasks/${t.id}`}>{t.title}</Link>}</td>
                  <td className="px-3 py-2">{projectName(t.projectId)}</td>
                  {isM && <td className="px-3 py-2">{userName(t.assigneeId)}</td>}
                  <td className="px-3 py-2">{range(t)}</td>
                  <td className="px-3 py-2"><Badge>{t.priority}</Badge></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {isM ? <Badge>{t.status}</Badge> : (
                        <select aria-label="Task status" className="rounded border border-slate-300 px-1 py-0.5" value={t.status} onChange={(e) => { setStatus(t.id, e.target.value); notify('Status updated.'); }}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      )}
                      {isOverdue(t) && <Badge>Overdue</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isM && <div className="flex justify-end gap-1"><Button variant="ghost" aria-label="Edit task" onClick={() => setForm(t)}><Pencil size={14} /></Button><Button variant="ghost" aria-label="Delete task" onClick={() => setDel(t)}><Trash2 size={14} /></Button></div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {form && <TaskForm task={form.id ? form : null} onClose={() => setForm(null)} />}
      {del && <Confirm text={`Delete task "${del.title}"? This cannot be undone.`} onNo={() => setDel(null)} onYes={() => { deleteTask(del.id); notify('Task deleted.'); setDel(null); }} />}
    </div>
  );
}
