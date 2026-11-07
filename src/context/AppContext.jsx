import { createContext, useContext, useEffect, useState } from 'react';
import { load, save, uid } from '../utils/storage';
import { hashPassword, makeJoinCode } from '../utils/scheduling';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const now = () => new Date().toISOString();

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => load('users', []));
  const [projects, setProjects] = useState(() => load('projects', []));
  const [tasks, setTasks] = useState(() => load('tasks', []));
  const [sessionId, setSessionId] = useState(() => load('session', null));
  const [toast, setToast] = useState(null);

  useEffect(() => save('users', users), [users]);
  useEffect(() => save('projects', projects), [projects]);
  useEffect(() => save('tasks', tasks), [tasks]);
  useEffect(() => save('session', sessionId), [sessionId]);

  const user = users.find((u) => u.id === sessionId) || null;
  const isManager = user?.role === 'manager';
  const myProjects = !user ? [] : projects.filter((p) => (isManager ? p.managerId === user.id : p.memberIds.includes(user.id)));
  const inMyProjects = (t) => myProjects.some((p) => p.id === t.projectId);
  const myTasks = !user ? [] : tasks.filter((t) => inMyProjects(t) && (isManager || t.assigneeId === user.id));
  const userName = (id) => users.find((u) => u.id === id)?.name ?? 'Unknown';
  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? 'Unknown';

  const notify = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth actions return an error message string, or null on success.
  const register = async ({ name, email, password, role }) => {
    const e = email.trim().toLowerCase();
    if (users.some((u) => u.email === e)) return 'An account with this email already exists.';
    const salt = uid();
    const u = { id: uid(), name: name.trim(), email: e, role, salt, passwordHash: await hashPassword(password, salt), createdAt: now() };
    setUsers([...users, u]);
    setSessionId(u.id);
    return null;
  };
  const login = async (email, password) => {
    const u = users.find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.passwordHash !== (await hashPassword(password, u.salt))) return 'Invalid email or password.';
    setSessionId(u.id);
    return null;
  };
  const logout = () => setSessionId(null);

  const saveProject = (data) => {
    if (!isManager) return;
    if (data.id) setProjects((ps) => ps.map((p) => (p.id === data.id && p.managerId === user.id ? { ...p, ...data } : p)));
    else
      setProjects((ps) => [
        ...ps,
        { ...data, id: uid(), managerId: user.id, memberIds: [], joinCode: makeJoinCode(ps.map((p) => p.joinCode)), createdAt: now() },
      ]);
  };
  const deleteProject = (id) => {
    if (!isManager || !myProjects.some((p) => p.id === id)) return;
    setProjects((ps) => ps.filter((p) => p.id !== id));
    setTasks((ts) => ts.filter((t) => t.projectId !== id)); // keep related records consistent
  };
  const joinProject = (code) => {
    const c = code.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!c) return { error: 'Please enter a join code.' };
    const p = projects.find((x) => x.joinCode === c);
    if (!p) return { error: 'Invalid join code. Check it and try again.' };
    if (p.memberIds.includes(user.id)) return { error: 'You have already joined this project.' };
    setProjects((ps) => ps.map((x) => (x.id === p.id ? { ...x, memberIds: [...x.memberIds, user.id] } : x)));
    return { project: p };
  };

  const saveTask = (data) => {
    const p = myProjects.find((x) => x.id === data.projectId);
    if (!isManager || !p || !p.memberIds.includes(data.assigneeId)) return false;
    setTasks((ts) => (data.id ? ts.map((t) => (t.id === data.id ? { ...t, ...data } : t)) : [...ts, { ...data, id: uid(), createdAt: now() }]));
    return true;
  };
  const deleteTask = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (isManager && t && inMyProjects(t)) setTasks((ts) => ts.filter((x) => x.id !== id));
  };
  // Only the assigned developer can change a task's status.
  const setStatus = (id, status) =>
    setTasks((ts) => ts.map((t) => (t.id === id && t.assigneeId === user?.id ? { ...t, status } : t)));

  const value = {
    user, users, projects, tasks, myProjects, myTasks, toast, notify, userName, projectName,
    register, login, logout, saveProject, deleteProject, joinProject, saveTask, deleteTask, setStatus,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
