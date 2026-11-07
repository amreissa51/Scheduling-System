import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Field, Modal } from './ui';
import { PRIORITIES, STATUSES, findConflicts, range, today } from '../utils/scheduling';

export default function TaskForm({ task, projectId, onClose }) {
  const { myProjects, users, tasks, saveTask, notify, projectName } = useApp();
  const [f, setF] = useState(
    task || { title: '', description: '', projectId: projectId || myProjects[0]?.id || '', assigneeId: '', startDate: today(), deadline: today(), priority: 'Medium', status: 'Opened' }
  );
  const [errs, setErrs] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const members = users.filter((u) => myProjects.find((p) => p.id === f.projectId)?.memberIds.includes(u.id));

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value, ...(k === 'projectId' ? { assigneeId: '' } : {}) });
    setConflicts([]);
  };
  const commit = () => {
    if (saveTask(f)) notify(task ? 'Task updated.' : 'Task created.');
    else notify('Could not save the task.', 'error');
    onClose();
  };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.title.trim()) er.title = 'Title is required.';
    if (!f.projectId) er.projectId = 'Choose a project.';
    if (!f.assigneeId) er.assigneeId = 'Assign the task to a project member.';
    if (!f.startDate) er.startDate = 'Start date is required.';
    if (!f.deadline) er.deadline = 'Deadline is required.';
    else if (f.startDate > f.deadline) er.deadline = 'Deadline cannot be before the start date.';
    setErrs(er);
    if (Object.keys(er).length) return;
    const found = findConflicts(f, tasks);
    if (found.length) setConflicts(found);
    else commit();
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Title" value={f.title} onChange={set('title')} error={errs.title} />
        <Field as="textarea" rows={2} label="Description" value={f.description} onChange={set('description')} />
        <Field as="select" label="Project" value={f.projectId} onChange={set('projectId')} error={errs.projectId}>
          {myProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Field>
        <Field as="select" label="Assign to" value={f.assigneeId} onChange={set('assigneeId')} error={errs.assigneeId}>
          <option value="">{members.length ? 'Select a developer' : 'No developers have joined this project'}</option>
          {members.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field type="date" label="Start date" value={f.startDate} onChange={set('startDate')} error={errs.startDate} />
          <Field type="date" label="Deadline" value={f.deadline} onChange={set('deadline')} error={errs.deadline} />
          <Field as="select" label="Priority" value={f.priority} onChange={set('priority')}>{PRIORITIES.map((x) => <option key={x}>{x}</option>)}</Field>
          <Field as="select" label="Status" value={f.status} onChange={set('status')}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</Field>
        </div>
        {conflicts.length > 0 ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="flex items-center gap-1.5 font-medium"><AlertTriangle size={16} /> Scheduling conflict</p>
            <p className="mt-1">This developer already has overlapping work:</p>
            <ul className="mt-1 list-disc pl-5">
              {conflicts.map((c) => <li key={c.id}>{c.title} ({projectName(c.projectId)}, {range(c)})</li>)}
            </ul>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setConflicts([])}>Cancel</Button>
              <Button type="button" onClick={commit}>Save anyway</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{task ? 'Save changes' : 'Create task'}</Button>
          </div>
        )}
      </form>
    </Modal>
  );
}
