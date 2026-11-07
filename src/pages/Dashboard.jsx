import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Badge, Card, Stat } from '../components/ui';
import { isOverdue, isUpcoming } from '../utils/scheduling';

function TaskList({ title, tasks, empty }) {
  const { user, projectName } = useApp();
  return (
    <Card>
      <h2 className="mb-2 font-semibold">{title}</h2>
      {tasks.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="min-w-0">
                {user.role === 'developer' ? <Link className="font-medium hover:underline" to={`/developer/tasks/${t.id}`}>{t.title}</Link> : <span className="font-medium">{t.title}</span>}
                <span className="block truncate text-xs text-slate-500">{projectName(t.projectId)} · due {t.deadline}</span>
              </span>
              <Badge>{t.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { user, myProjects, myTasks } = useApp();
  const isM = user.role === 'manager';
  const n = (s) => myTasks.filter((t) => t.status === s).length;
  const byDeadline = (a, b) => a.deadline.localeCompare(b.deadline);
  const stats = [
    [isM ? 'Total projects' : 'Joined projects', myProjects.length],
    [isM ? 'Total tasks' : 'Assigned tasks', myTasks.length],
    ['In progress', n('In Progress'), 'text-blue-600'],
    ['Completed', n('Completed'), 'text-emerald-600'],
    ['Overdue', myTasks.filter(isOverdue).length, 'text-red-600'],
  ];
  const recent = [...myTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="space-y-4">
      <p className="text-slate-600">Welcome back, {user.name}.</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{stats.map(([l, v, t]) => <Stat key={l} label={l} value={v} tone={t} />)}</div>
      {isM && (
        <div className="flex flex-wrap gap-2 text-sm">
          {[['projects', 'Projects'], ['tasks', 'Tasks'], ['calendar', 'Team calendar']].map(([p, l]) => (
            <Link key={p} to={`/manager/${p}`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">{l}</Link>
          ))}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <TaskList title="Upcoming deadlines (14 days)" tasks={myTasks.filter((t) => isUpcoming(t)).sort(byDeadline).slice(0, 5)} empty="No deadlines coming up." />
        <TaskList title="Overdue tasks" tasks={myTasks.filter(isOverdue).sort(byDeadline).slice(0, 5)} empty="Nothing overdue." />
        {isM && <TaskList title="Recent tasks" tasks={recent} empty="No tasks yet. Create one from the Tasks page." />}
      </div>
    </div>
  );
}
