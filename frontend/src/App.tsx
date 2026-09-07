import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/molecules/ProtectedRoute';
import { GuestRoute } from './components/molecules/GuestRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPlaceholderPage } from './pages/DashboardPlaceholderPage';

function DefaultRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholderPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
