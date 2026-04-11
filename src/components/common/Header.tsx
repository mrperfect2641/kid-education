import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { profilesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Leaf, Menu, LogOut, User, Trophy, BookOpen, Gamepad2, Award, Upload, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile } from '@/types/types';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getNavItems = () => {
    if (!profile) return [];

    // Student navigation - can play games and quizzes
    if (profile.role === 'student') {
      return [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'Learn', path: '/learn', icon: BookOpen },
        { name: 'Quizzes', path: '/quizzes', icon: Award },
        { name: 'Challenges', path: '/challenges', icon: Gamepad2 },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'My Progress', path: '/progress', icon: User },
        { name: 'Eco Actions', path: '/eco-actions', icon: Upload },
      ];
    }

    // Teacher navigation - manage content, view results, no playing
    if (profile.role === 'teacher') {
      return [
        { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
        { name: 'Manage Quizzes', path: '/teacher?tab=quizzes', icon: Award },
        { name: 'Manage Games', path: '/teacher?tab=games', icon: Gamepad2 },
        { name: 'Learning Modules', path: '/teacher?tab=modules', icon: BookOpen },
        { name: 'Leaderboard', path: '/teacher?tab=leaderboard', icon: Trophy },
        { name: 'Eco Actions', path: '/teacher?tab=overview', icon: Upload },
      ];
    }

    // Admin navigation - all modules available via tabs
    if (profile.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'User Management', path: '/admin?tab=users', icon: User },
        { name: 'Manage Quizzes', path: '/admin?tab=quizzes', icon: Award },
        { name: 'Manage Games', path: '/admin?tab=games', icon: Gamepad2 },
        { name: 'Learning Modules', path: '/admin?tab=modules', icon: BookOpen },
        { name: 'Leaderboard', path: '/admin?tab=leaderboard', icon: Trophy },
        { name: 'Eco Actions', path: '/admin?tab=eco-actions', icon: Upload },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-smooth ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
              } ${mobile ? 'w-full' : ''}`}
          >
            <Icon className="w-4 h-4" />
            <span className={mobile ? 'text-base' : 'text-sm font-medium'}>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  if (loading) {
    return (
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold gradient-text">EcoLearn</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">EcoLearn</span>
          </Link>

          {profile && (
            <nav className="hidden xl:flex items-center gap-2">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{profile.full_name || profile.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="xl:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.full_name || profile.username}</p>
                        <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                        <p className="text-xs text-primary font-medium">{profile.total_points} points</p>
                      </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                      <NavLinks mobile />
                    </nav>

                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full mt-auto"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

