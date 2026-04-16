import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/common/Header';
import routes from './routes';
import { authStore } from '@/lib/auth';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/admin-login'].includes(location.pathname);

  const hasToken = Boolean(authStore.getToken());
  if (!hasToken && !isAuthPage && location.pathname !== '/404') {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <AppContent />
    </Router>
  );
};

export default App;
