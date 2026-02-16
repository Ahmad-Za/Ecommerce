import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { LayoutDashboard, ShoppingBag, ShoppingCart, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const Navbar = () => {
    const location = useLocation();
    const { cartCount, setIsCartOpen } = useCart();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check initial user (Mock or Real)
        const mockSession = sessionStorage.getItem('sb-mock-session');
        if (mockSession) {
            setUser(JSON.parse(mockSession).user);
        } else {
            supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
        }

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!sessionStorage.getItem('sb-mock-session')) {
                setUser(session?.user ?? null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        if (sessionStorage.getItem('sb-mock-session')) {
            sessionStorage.removeItem('sb-mock-session');
            setUser(null);
            window.location.href = '/login'; // Force reload/redirect
        } else {
            await supabase.auth.signOut();
        }
        toast.info("Logged out successfully");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                        <span className="font-bold text-white text-lg">Z</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 group-hover:to-primary transition-all duration-300">
                        ZOOM
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-1.5 rounded-full border border-white/10">
                    <Link
                        to="/"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${location.pathname === '/'
                            ? 'bg-primary/20 text-primary shadow-neon'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5 hover:shadow-neon'
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden sm:inline">Store</span>
                    </Link>

                    {user ? (
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${location.pathname === '/admin'
                                ? 'bg-primary/20 text-primary shadow-neon'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 hover:shadow-neon'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${location.pathname === '/login'
                                ? 'bg-primary/20 text-primary shadow-neon'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 hover:shadow-neon'
                                }`}
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="rounded-full hidden sm:flex hover:bg-destructive/10 hover:text-destructive"
                            title="Log Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex" title="Log In">
                                <LogIn className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </Button>
                        </Link>
                    )}

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2.5 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-all duration-300 group border border-white/5 hover:border-primary/30"
                    >
                        <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-in zoom-in spin-in-12 duration-300">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
