import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-4 text-center">
      <p className="text-5xl font-semibold text-indigo-600">404</p>
      <p className="text-slate-600">This page does not exist.</p>
      <Link className="font-medium text-indigo-600" to="/">Go to Scheduling System</Link>
    </div>
  );
}
