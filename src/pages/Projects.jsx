import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card, Confirm, Empty, Field, Modal } from '../components/ui';
import { percentDone, today } from '../utils/scheduling';

function ProjectForm({ project, onClose }) {
  const { saveProject, notify } = useApp();
  const [f, setF] = useState(project || { name: '', description: '', startDate: today(), deadline: today() });
  const [errs, setErrs] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Project name is required.';
    if (!f.startDate) er.startDate = 'Start date is required.';
    if (!f.deadline) er.deadline = 'Deadline is required.';
    else if (f.startDate > f.deadline) er.deadline = 'Deadline cannot be before the start date.';
    setErrs(er);
    if (Object.keys(er).length) return;
    saveProject({ ...f, name: f.name.trim() });
    notify(project ? 'Project updated.' : 'Project created.');
    onClose();
  };
  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Project name" value={f.name} onChange={set('name')} error={errs.name} />
        <Field as="textarea" rows={3} label="Description" value={f.description} onChange={set('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Field type="date" label="Start date" value={f.startDate} onChange={set('startDate')} error={errs.startDate} />
          <Field type="date" label="Deadline" value={f.deadline} onChange={set('deadline')} error={errs.deadline} />
        </div>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">{project ? 'Save changes' : 'Create project'}</Button></div>
      </form>
    </Modal>
  );
}

export default function Projects() {
  const { myProjects, myTasks, deleteProject, notify } = useApp();
  const [form, setForm] = useState(null); // null = closed, {} = new, project = edit
  const [del, setDel] = useState(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setForm({})}><Plus size={16} /> New project</Button></div>
      {myProjects.length === 0 ? (
        <Empty title="No projects yet" text="Create your first project to get a join code for your developers."><Button onClick={() => setForm({})}>Create project</Button></Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myProjects.map((p) => {
            const pt = myTasks.filter((t) => t.projectId === p.id);
            const pct = percentDone(pt);
            return (
              <Card key={p.id} className="flex flex-col gap-3">
                <div>
                  <Link to={`/manager/projects/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                  <p className="text-xs text-slate-500">{p.startDate} to {p.deadline}</p>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{p.description || 'No description.'}</p>
                <p className="text-sm text-slate-600">{p.memberIds.length} developer(s) · {pt.length} task(s)</p>
                <div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${pct}%` }} /></div><p className="mt-1 text-xs text-slate-500">{pct}% complete</p></div>
                <div className="mt-auto flex gap-2">
                  <Link to={`/manager/projects/${p.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Open</Link>
                  <Button variant="ghost" aria-label="Edit project" onClick={() => setForm(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" aria-label="Delete project" onClick={() => setDel(p)}><Trash2 size={14} /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {form && <ProjectForm project={form.id ? form : null} onClose={() => setForm(null)} />}
      {del && <Confirm text={`Delete "${del.name}" and all of its tasks? This cannot be undone.`} onNo={() => setDel(null)} onYes={() => { deleteProject(del.id); notify('Project deleted.'); setDel(null); }} />}
    </div>
  );
}
