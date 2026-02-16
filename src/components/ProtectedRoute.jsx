import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!localStorage.getItem('sb-mock-session')) {
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function checkUser() {
        try {
            // Check for mock session first
            const mockSession = sessionStorage.getItem('sb-mock-session');
            if (mockSession) {
                setUser(JSON.parse(mockSession).user);
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error("Auth check error", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Strict Email Check
    if (user.email !== 'ahmadzaatary63@gmail.com') {
        // Optional: Sign them out or just redirect
        return <div className="min-h-screen flex items-center justify-center bg-background text-destructive font-bold">Access Denied: Unauthorized Email</div>;
    }

    return <Outlet />;
}
