import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Leaf, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/types';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const { token, user } = await response.json();
      
      if (!user) {
        toast.error('Failed to login. No user data returned.');
        return;
      }

      // Check if selected role matches registered role
      if (user.role !== selectedRole) {
        const article = user.role === 'admin' ? 'an' : 'a';
        toast.error(`This account is registered as ${article} ${user.role}. Please select "${user.role}" to login.`);
        return;
      }

      // Store session after all validation passes
      authStore.setSession(token, user);
      toast.success(`Welcome back, ${user.username}!`);

      // Route based on the selected role (which matches registered role)
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else if (selectedRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Login failed. Please try again.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your environmental learning journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login As</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the role you registered with</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="flex flex-col space-y-2 text-sm text-center text-muted-foreground w-full">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <div className="pt-2 border-t flex justify-center mt-2">
                <Link to="/admin-login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Administrator Login
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
