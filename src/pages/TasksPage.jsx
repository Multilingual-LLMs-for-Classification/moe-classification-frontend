import { Navigate } from 'react-router-dom';

// Task configurations are now managed per-project at /projects/:id/config
export default function TasksPage() {
  return <Navigate to="/projects" replace />;
}
