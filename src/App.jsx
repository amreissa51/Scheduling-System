import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import { TeamCalendar, MyCalendar, DeveloperSchedule } from './pages/CalendarPages';
import { MyProjects, JoinProject } from './pages/DeveloperProjects';
import NotFound from './pages/NotFound';

// Redirects logged-out users to login and users with the wrong role to their own dashboard.
function Guard({ role }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <AppLayout />;
}

export default function App() {
  const { user, toast } = useApp();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manager" element={<Guard role="manager" />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<TeamCalendar />} />
          <Route path="schedule" element={<DeveloperSchedule />} />
        </Route>
        <Route path="/developer" element={<Guard role="developer" />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<MyProjects />} />
          <Route path="join" element={<JoinProject />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetails />} />
          <Route path="calendar" element={<MyCalendar />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {toast && (
        <div role="status" className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.text}
        </div>
      )}
    </>
  );
}
