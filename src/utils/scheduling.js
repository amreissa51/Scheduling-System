export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Opened', 'In Progress', 'Completed'];

export const today = () => {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const addDays = (date, n) => new Date(Date.parse(date) + n * 864e5).toISOString().slice(0, 10);
export const isOverdue = (t) => t.status !== 'Completed' && t.deadline < today();
export const isUpcoming = (t, days = 14) =>
  t.status !== 'Completed' && t.deadline >= today() && t.deadline <= addDays(today(), days);
export const percentDone = (tasks) =>
  tasks.length ? Math.round((tasks.filter((t) => t.status === 'Completed').length / tasks.length) * 100) : 0;
export const range = (t) => (t.startDate === t.deadline ? t.startDate : `${t.startDate} to ${t.deadline}`);

// Two inclusive date ranges overlap when each starts before the other ends.
export const overlaps = (a, b) => a.startDate <= b.deadline && b.startDate <= a.deadline;

// Conflict rule (used everywhere): same developer, both tasks not Completed, ranges overlap.
export const findConflicts = (task, tasks) =>
  task.status === 'Completed'
    ? []
    : tasks.filter(
        (t) => t.id !== task.id && t.assigneeId === task.assigneeId && t.status !== 'Completed' && overlaps(t, task)
      );

export const conflictPairs = (tasks) => {
  const open = tasks.filter((t) => t.status !== 'Completed');
  const pairs = [];
  open.forEach((a, i) =>
    open.slice(i + 1).forEach((b) => {
      if (a.assigneeId === b.assigneeId && overlaps(a, b)) pairs.push([a, b]);
    })
  );
  return pairs;
};

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const makeJoinCode = (existing) => {
  let code;
  do code = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
  while (existing.includes(code));
  return code;
};

// DEMO ONLY: salted SHA-256 in the browser. This is not secure production authentication.
export async function hashPassword(password, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
