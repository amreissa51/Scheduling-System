// Reusable LocalStorage helper. All reads are defensive: corrupted data falls back to defaults.
const KEYS = { users: 'ss_users', projects: 'ss_projects', tasks: 'ss_tasks', session: 'ss_session' };

export function load(name, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(KEYS[name]));
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export function save(name, value) {
  try {
    localStorage.setItem(KEYS[name], JSON.stringify(value));
  } catch {
    /* storage full or unavailable: ignore */
  }
}

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
