import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import { useAuth } from './context/AuthContext';

const WelcomePage = lazy(() => import('./pages/auth/WelcomePage'));
const AuthFormPage = lazy(() => import('./pages/auth/AuthFormPage'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const ReportIssuePage = lazy(() => import('./pages/citizen/ReportIssuePage'));
const TrackIssuesPage = lazy(() => import('./pages/citizen/TrackIssuesPage'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const SmartMatchingPage = lazy(() => import('./pages/volunteer/SmartMatchingPage'));
const TaskDetailsPage = lazy(() => import('./pages/volunteer/TaskDetailsPage'));
const VolunteerAvailabilityPage = lazy(() => import('./pages/volunteer/VolunteerAvailabilityPage'));
const NgoDashboard = lazy(() => import('./pages/ngo/NgoDashboard'));
const IssueManagementPage = lazy(() => import('./pages/ngo/IssueManagementPage'));
const SmartAllocationPage = lazy(() => import('./pages/ngo/SmartAllocationPage'));
const NgoNetworkPage = lazy(() => import('./pages/ngo/NgoNetworkPage'));
const UserResourcesPage = lazy(() => import('./pages/citizen/UserResourcesPage'));

function RoleHomeRedirect() {
  const auth = useAuth();
const user = auth?.user;
  if (!user) return <Navigate to="/welcome" replace />;
  const roleRoutes = {
    user: '/user/dashboard',
    volunteer: '/volunteer/dashboard',
    ngo: '/ngo/dashboard',
  };
  return <Navigate to={roleRoutes[user.role] || '/welcome'} replace />;
}

function ProtectedRoute({ allowedRoles, children }) {
  const auth = useAuth();
const user = auth?.user;
  if (!user) return <Navigate to="/welcome" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <RoleHomeRedirect />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading operational workspace...</div>}>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/login" element={<AuthFormPage mode="login" />} />
        <Route path="/auth/signup" element={<AuthFormPage mode="signup" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleHomeRedirect />} />
          <Route path="user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="user/report" element={<ProtectedRoute allowedRoles={['user']}><ReportIssuePage /></ProtectedRoute>} />
          <Route path="user/issues" element={<ProtectedRoute allowedRoles={['user']}><TrackIssuesPage /></ProtectedRoute>} />
          <Route path="user/resources" element={<ProtectedRoute allowedRoles={['user']}><UserResourcesPage /></ProtectedRoute>} />
          <Route path="volunteer/dashboard" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="volunteer/matching" element={<ProtectedRoute allowedRoles={['volunteer']}><SmartMatchingPage /></ProtectedRoute>} />
          <Route path="volunteer/tasks/:taskId" element={<ProtectedRoute allowedRoles={['volunteer']}><TaskDetailsPage /></ProtectedRoute>} />
          <Route path="volunteer/availability" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerAvailabilityPage /></ProtectedRoute>} />
          <Route path="ngo/dashboard" element={<ProtectedRoute allowedRoles={['ngo']}><NgoDashboard /></ProtectedRoute>} />
          <Route path="ngo/issues" element={<ProtectedRoute allowedRoles={['ngo']}><IssueManagementPage /></ProtectedRoute>} />
          <Route path="ngo/allocation" element={<ProtectedRoute allowedRoles={['ngo']}><SmartAllocationPage /></ProtectedRoute>} />
          <Route path="ngo/network" element={<ProtectedRoute allowedRoles={['ngo']}><NgoNetworkPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Suspense>
  );
}
