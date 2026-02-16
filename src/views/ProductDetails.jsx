import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Share2, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('M');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    async function fetchProduct() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Could not load product details");
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCart = () => {
        addToCart(product);
        toast.success(`Added ${product.name} to cart`);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Button onClick={() => navigate('/')}>Return to Store</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Store
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-square lg:aspect-auto lg:h-[600px]"
                    >
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-primary transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-primary transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                {product.category || 'Exclusive'}
                            </span>
                            <div className="flex items-center text-amber-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm ml-1">4.9 (128 reviews)</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-mono text-primary mb-8">
                            ${product.price}
                        </p>

                        <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground max-w-none mb-8 leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {product.ai_description || product.raw_description}
                            </ReactMarkdown>
                        </div>

                        {/* Size Selector (Mock) */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium mb-3 text-gray-400">Select Size</h3>
                            <div className="flex gap-3">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all border ${selectedSize === size
                                            ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                            : 'border-white/10 hover:border-white/30 text-gray-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 py-6 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
                            >
                                <ShoppingCart className="mr-2" /> Add to Cart
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
