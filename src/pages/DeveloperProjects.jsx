import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Empty, Field } from '../components/ui';
import { percentDone } from '../utils/scheduling';

export function MyProjects() {
  const { myProjects, myTasks, userName } = useApp();
  if (!myProjects.length) return <Empty title="You haven't joined any projects" text="Ask your Project Manager for a join code."><Link className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white" to="/developer/join">Join a project</Link></Empty>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {myProjects.map((p) => {
        const pt = myTasks.filter((t) => t.projectId === p.id);
        return (
          <Card key={p.id} className="space-y-2">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-xs text-slate-500">Manager: {userName(p.managerId)} · {p.startDate} to {p.deadline}</p>
            <p className="text-sm text-slate-600">{p.description || 'No description.'}</p>
            <p className="text-sm text-slate-600">{pt.length} task(s) assigned to you · {percentDone(pt)}% done</p>
          </Card>
        );
      })}
    </div>
  );
}

export function JoinProject() {
  const { joinProject, notify } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const res = joinProject(code);
    if (res.error) return setErr(res.error);
    setErr('');
    setCode('');
    notify(`You joined "${res.project.name}".`);
  };
  return (
    <Card className="max-w-md space-y-3">
      <p className="text-sm text-slate-600">Enter the join code from your Project Manager. You can join as many projects as you need.</p>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Join code" value={code} onChange={(e) => setCode(e.target.value)} error={err} placeholder="e.g. K7M2QX" />
        <Button type="submit">Join project</Button>
      </form>
    </Card>
  );
}
