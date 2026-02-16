import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Eye, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardFooter, Button, Input } from '@/components/ui';
import ChatButton from '@/components/Chatbot/ChatButton';
import ChatWindow from '@/components/Chatbot/ChatWindow';
import { toast } from 'sonner';

const Store = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            setLoading(true);
            // Only fetch visible products
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_visible', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data);

            // Extract unique categories
            if (data) {
                const uniqueCategories = ["All", ...new Set(data.map(p => p.category).filter(Boolean))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Error fetching products:', error.message);
            toast.error("Low-latency network error. Using cached/fallback data.");
            // Fallback for demo if column doesn't exist yet
            if (error.message.includes('is_visible')) {
                const { data } = await supabase.from('products').select('*');
                setProducts(data || []);
                if (data) {
                    const uniqueCategories = ["All", ...new Set(data.map(p => p.category).filter(Boolean))];
                    setCategories(uniqueCategories);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = activeCategory === "All" || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, activeCategory, searchQuery]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`Added ${product.name} to cart`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background blur-3xl"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6 inline-block shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        AI-Powered Commerce
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/50 to-white/50">
                        Future of Shopping
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Experience the next generation of retail with AI-curated collections and predictive styling.
                    </p>
                </motion.div>
            </section>

            {/* Smart Navigation & Search */}
            <section className="px-6 mb-12 flex flex-col items-center gap-6">

                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-white/10 focus:border-primary rounded-full backdrop-blur-sm transition-all"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === category
                                ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)] scale-105"
                                : "bg-card border-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 p-4 max-w-7xl mx-auto">

                {loading ? (
                    // Skeleton Loading State
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl overflow-hidden border border-white/5 p-4 space-y-4 animate-pulse">
                            <div className="h-64 bg-white/5 rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-6 bg-white/5 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                            </div>
                            <div className="h-10 bg-white/5 rounded-xl"></div>
                        </div>
                    ))
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                        >

                            {/* Image Area */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                                    <Link to={`/product/${product.id}`} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-primary transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>

                                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/10">
                                    {product.category || 'General'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                    <span className="text-primary font-mono font-bold">${product.price}</span>
                                </div>

                                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4 h-10">
                                    {product.ai_description || product.raw_description}
                                </p>

                                <Button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full bg-white/5 hover:bg-primary hover:text-white text-white border border-white/10 hover:border-primary transition-all duration-300 rounded-xl"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                </Button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No products found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Floating Chatbot */}
            <ChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(true)} />
            <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default Store;
