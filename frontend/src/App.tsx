import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/molecules/ProtectedRoute';
import { GuestRoute } from './components/molecules/GuestRoute';
import { RoleRoute } from './components/molecules/RoleRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CheckEmailPage } from './pages/CheckEmailPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPlaceholderPage } from './pages/DashboardPlaceholderPage';
import { ZonesPage } from './pages/ZonesPage';

function DefaultRedirect() {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'administrador' ? '/panel-administrativo' : '/dashboard'} replace />;
}

function DashboardEntry() {
  const { user } = useAuth();
  if (user?.role === 'administrador') {
    return <Navigate to="/panel-administrativo" replace />;
  }
  return <DashboardPlaceholderPage />;
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
      <Route path="/revisa-tu-correo" element={<CheckEmailPage />} />
      <Route path="/verificar-correo" element={<VerifyEmailPage />} />
      <Route path="/olvide-mi-contrasena" element={<ForgotPasswordPage />} />
      <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel-administrativo"
        element={
          <RoleRoute roles={['administrador']}>
            <ZonesPage />
          </RoleRoute>
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
