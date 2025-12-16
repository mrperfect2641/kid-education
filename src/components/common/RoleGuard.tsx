import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { profilesApi } from '@/db/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserRole } from '@/types/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo = '/' }: RoleGuardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profilesApi.getCurrentUser();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect based on user role
    if (profile.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
