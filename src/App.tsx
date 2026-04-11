import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import { Toaster } from 'sonner';
import Header from '@/components/common/Header';
import routes from './routes';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/admin-login'].includes(location.pathname);

  return (
    <RequireAuth whiteList={['/login', '/register', '/admin-login', '/404']}>
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
    </RequireAuth>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <Toaster position="top-center" richColors />
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
