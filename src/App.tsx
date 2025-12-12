import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import { Toaster } from 'sonner';
import Header from '@/components/common/Header';
import routes from './routes';

const App = () => {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <Toaster position="top-center" richColors />
        <RequireAuth whiteList={['/login', '/register', '/404']}>
          <div className="flex flex-col min-h-screen">
            <Header />
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
      </AuthProvider>
    </Router>
  );
};

export default App;
