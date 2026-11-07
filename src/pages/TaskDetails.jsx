import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Badge, Card, Field } from '../components/ui';
import { STATUSES, isOverdue, range } from '../utils/scheduling';

export default function TaskDetails() {
  const { id } = useParams();
  const { myTasks, projectName, setStatus, notify } = useApp();
  const t = myTasks.find((x) => x.id === id); // myTasks only holds this developer's own tasks
  if (!t) return <Card><p>This task was not found or is not assigned to you.</p><Link className="text-indigo-600" to="/developer/tasks">Back to my tasks</Link></Card>;
  return (
    <Card className="max-w-2xl space-y-3">
      <h2 className="text-xl font-semibold">{t.title}</h2>
      <p className="text-slate-600">{t.description || 'No description.'}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-slate-500">Project</dt><dd>{projectName(t.projectId)}</dd></div>
        <div><dt className="text-slate-500">Schedule</dt><dd>{range(t)}</dd></div>
        <div><dt className="text-slate-500">Priority</dt><dd><Badge>{t.priority}</Badge></dd></div>
        <div><dt className="text-slate-500">Deadline</dt><dd>{t.deadline} {isOverdue(t) && <Badge>Overdue</Badge>}</dd></div>
      </dl>
      <Field as="select" label="Status" value={t.status} onChange={(e) => { setStatus(t.id, e.target.value); notify('Status updated.'); }}>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </Field>
      <Link className="text-sm font-medium text-indigo-600" to="/developer/tasks">Back to my tasks</Link>
    </Card>
  );
}
