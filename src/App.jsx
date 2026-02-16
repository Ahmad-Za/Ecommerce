import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Store from './views/Store';
import Admin from './views/Admin';
import Login from './views/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './views/ProductDetails';
import CartSidebar from './components/CartSidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'sonner';

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <ScrollToTop />
                <div className="font-sans antialiased text-foreground bg-background min-h-screen selection:bg-primary/30 flex flex-col">
                    <Navbar />

                    <main className="flex-grow pt-16">
                        <Routes>
                            <Route path="/" element={<Store />} />
                            <Route path="/login" element={<Login />} />

                            {/* Protected Admin Route */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/admin" element={<Admin />} />
                            </Route>

                            <Route path="/product/:id" element={<ProductDetails />} />
                        </Routes>
                    </main>

                    <Footer />

                    {/* Overlays */}
                    <CartSidebar />
                    <Toaster position="bottom-right" theme="dark" richColors />
                </div>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;
