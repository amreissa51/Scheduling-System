# Scheduling System

A frontend-only project scheduling app for a Project Manager and their developers. Built with React (Vite), Tailwind CSS, React Router, the Context API, and LocalStorage.

## Run it

```bash
npm install
npm run dev      # development server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Features

- **Roles:** Project Manager and Developer, each with their own dashboard, navigation, and protected routes.
- **Auth:** register (validated, duplicate emails rejected), log in, log out, session kept across refreshes.
- **Projects:** managers create, edit, and delete projects; each gets a unique 6-character join code with a copy button.
- **Join workflow:** developers join with a code (invalid, empty, and duplicate joins are handled) and may join many projects.
- **Tasks:** managers create, edit, delete (with confirmation), and filter tasks by project, developer, status, priority, and deadline. Developers change the status of their own tasks only.
- **Calendar:** monthly view with month navigation, priority/status indicators, and an upcoming list. Managers get a team calendar and a per-developer schedule; developers get a personal calendar.
- **Conflict detection:** saving a task checks the same developer's other tasks for overlapping dates. Completed tasks are ignored, other developers' tasks are never conflicts, and the manager can cancel or choose "Save anyway". The same rule feeds the warnings on the calendar pages.
- **Dashboards:** simple stat cards, upcoming deadlines, and overdue tasks. Managers also see recent tasks.

## Project structure

```
src/
  context/AppContext.jsx    shared state + all actions (auth, projects, tasks)
  utils/storage.js          LocalStorage load/save helpers
  utils/scheduling.js       dates, conflict rules, join codes, password hashing
  layouts/AppLayout.jsx     sidebar, top bar, logout
  components/               ui.jsx (button, field, modal, badge...), Calendar, TaskForm
  pages/                    Auth, Dashboard, Projects, ProjectDetails, Tasks, TaskDetails,
                            CalendarPages, DeveloperProjects, NotFound
```

## Limitations (please read)

- **Data lives only in this browser.** LocalStorage is isolated per browser profile and device. Accounts and join codes work only between users of the same browser's stored data. This is **not** a multi-user cloud application.
- **Authentication is a demo.** Passwords are stored as salted SHA-256 hashes, which avoids plain text, but hashing runs in the browser, anyone with access to the browser can read or edit LocalStorage, and role checks are enforced only in the UI. Do not use this approach in production.
- Anyone can register as a Project Manager (by design for this demo).
- Clearing site data deletes everything. There is no export or reset button.
