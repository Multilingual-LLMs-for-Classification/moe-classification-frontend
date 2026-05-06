import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ActiveProjectProvider } from './context/ActiveProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClassifyPage from './pages/ClassifyPage';
import DashboardPage from './pages/DashboardPage';
import ConfigLayout from './pages/ConfigLayout';
import BaseModelsPage from './pages/BaseModelsPage';
import RouterConfigPage from './pages/RouterConfigPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectLayout from './pages/ProjectLayout';
import ProjectAnalyticsPage from './pages/ProjectAnalyticsPage';
import ProjectConfigPage from './pages/ProjectConfigPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ActiveProjectProvider>
        <Navbar />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/classify" element={<ProtectedRoute><ClassifyPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="analytics" replace />} />
                <Route path="analytics" element={<ProjectAnalyticsPage />} />
                <Route path="config" element={<ProjectConfigPage />} />
              </Route>
              <Route path="/config" element={<ProtectedRoute><ConfigLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="base-models" replace />} />
                <Route path="base-models" element={<BaseModelsPage />} />
                <Route path="tasks" element={<Navigate to="/projects" replace />} />
                <Route path="router" element={<RouterConfigPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/classify" replace />} />
            </Routes>
          </main>
        </div>
        </ActiveProjectProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
