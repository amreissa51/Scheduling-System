import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Calendar from '../components/Calendar';
import { Card, Empty, Field } from '../components/ui';
import { conflictPairs, range } from '../utils/scheduling';

function Conflicts({ tasks }) {
  const { userName } = useApp();
  const pairs = conflictPairs(tasks);
  if (!pairs.length) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="flex items-center gap-1.5 font-medium"><AlertTriangle size={16} /> {pairs.length} scheduling conflict(s)</p>
      <ul className="mt-1 list-disc pl-5">
        {pairs.map(([a, b]) => <li key={a.id + b.id}>{userName(a.assigneeId)}: "{a.title}" ({range(a)}) overlaps "{b.title}" ({range(b)})</li>)}
      </ul>
    </div>
  );
}

export function TeamCalendar() {
  const { myProjects, myTasks } = useApp();
  const [pid, setPid] = useState('');
  const tasks = myTasks.filter((t) => !pid || t.projectId === pid);
  return (
    <div className="space-y-4">
      <Card className="max-w-xs"><Field as="select" label="Project" value={pid} onChange={(e) => setPid(e.target.value)}><option value="">All projects</option>{myProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Field></Card>
      <Conflicts tasks={tasks} />
      <Calendar tasks={tasks} />
    </div>
  );
}

export const MyCalendar = () => <Calendar tasks={useApp().myTasks} />;

export function DeveloperSchedule() {
  const { myProjects, myTasks, users } = useApp();
  const [dev, setDev] = useState('');
  const devs = users.filter((u) => myProjects.some((p) => p.memberIds.includes(u.id)));
  if (!devs.length) return <Empty title="No developers yet" text="Developers appear here after they join one of your projects with its join code." />;
  const tasks = myTasks.filter((t) => t.assigneeId === dev);
  return (
    <div className="space-y-4">
      <Card className="max-w-xs"><Field as="select" label="Developer" value={dev} onChange={(e) => setDev(e.target.value)}><option value="">Select a developer</option>{devs.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Field></Card>
      {dev ? <><Conflicts tasks={tasks} /><Calendar tasks={tasks} /></> : <p className="text-sm text-slate-500">Choose a developer to see their schedule.</p>}
    </div>
  );
}
