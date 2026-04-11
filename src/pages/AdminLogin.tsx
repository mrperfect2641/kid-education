import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { profilesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            const email = `${username}@miaoda.com`;
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const profile = await profilesApi.getProfile(data.user.id);

                if (!profile) {
                    toast.error('Profile not found. Please contact administrator.');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                // Strictly check if the user is an admin
                if (profile.role !== 'admin') {
                    toast.error('Access denied. Administrator privileges required.');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                toast.success(`Welcome back, Administrator ${profile.username}!`);

                navigate('/admin');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Invalid admin credentials');
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
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold gradient-text">Admin Portal</CardTitle>
                    <CardDescription>
                        Secure access for administrators only
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Admin Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter admin username"
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
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Secure Login'
                            )}
                        </Button>
                        <div className="flex flex-col space-y-2 text-sm text-center text-muted-foreground w-full">
                            <div className="pt-2 border-t flex justify-center mt-2">
                                <Button
                                    variant="link"
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors h-auto p-0"
                                    onClick={() => navigate('/login')}
                                    type="button"
                                >
                                    Return to standard login
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
