import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClassifyPage from './pages/ClassifyPage';
import DashboardPage from './pages/DashboardPage';
import ConfigLayout from './pages/ConfigLayout';
import BaseModelsPage from './pages/BaseModelsPage';
import TasksPage from './pages/TasksPage';
import RouterConfigPage from './pages/RouterConfigPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="/config" element={<ProtectedRoute><ConfigLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="base-models" replace />} />
                <Route path="base-models" element={<BaseModelsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="router" element={<RouterConfigPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/classify" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
