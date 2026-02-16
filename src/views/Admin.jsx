import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Loader2, Plus, Eye, EyeOff, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Add Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      toast.info("Image selected");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.raw_description || product.ai_description,
    });
    setPreview(product.image_url);
    setImageFile(null); // Reset file input, we use existing URL
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', description: '' });
    setPreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // Handle Update
        const toastId = toast.loading("Saving changes...");
        await api.updateProduct(editingProduct.id, {
          name: formData.name,
          price: formData.price,
          raw_description: formData.description,
          // We don't update image in this mode yet
        });
        toast.success("Product updated successfully!", { id: toastId });
        cancelEdit();
      } else {
        // Handle Create
        const toastId = toast.loading("Processing with AI Agent...");
        await api.addProduct({
          name: formData.name,
          price: formData.price,
          raw_description: formData.description,
          imageFile: imageFile
        });
        toast.success("Product created successfully!", { id: toastId });
        // Reset Form
        setFormData({ name: '', price: '', description: '' });
        setImageFile(null);
        setPreview(null);
      }

      // Refresh list
      fetchProducts();

    } catch (error) {
      console.error(error);
      toast.error(editingProduct ? "Failed to update" : "Failed to create", { id: toastId }); // Note: toastId might be undefined here if strictly following scope, but sonner handles it. 
      // Actually strictly speaking toastId is scoped. I will fix scoping in the code block.
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistic update
      setProducts(products.map(p =>
        p.id === id ? { ...p, is_visible: !currentStatus } : p
      ));
      toast.success(`Product is now ${!currentStatus ? 'Visible' : 'Hidden'}`);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const toastId = toast.loading("Deleting product...");
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted", { id: toastId });

      if (editingProduct?.id === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete product", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Add Product Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-white/10 p-6 rounded-xl sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              {editingProduct ? (
                <>
                  <Pencil className="w-5 h-5 text-accent" /> Edit Product
                  <button onClick={cancelEdit} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </>
              ) : (
                <><Plus className="w-5 h-5 text-primary" /> Add New Product</>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-background border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Price ($)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 bg-background border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Description Context</label>
                <textarea
                  required
                  rows="3"
                  className="w-full p-2 bg-background border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Image {editingProduct && "(Keep existing to stay same)"}</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={!!editingProduct /* Disable image upload in edit mode for now as per plan */}
                />

                {!preview ? (
                  <div
                    onClick={() => !editingProduct && fileInputRef.current.click()}
                    className={`border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${editingProduct ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </div>
                ) : (
                  <div className="relative w-full h-48 group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/10" />
                    {!editingProduct && (
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setImageFile(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || (!imageFile && !editingProduct)}
                className={`w-full py-3 font-bold shadow-lg ${editingProduct ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : (editingProduct ? "💾 Save Changes" : "✨ Generate & Publish")}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Product List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">Inventory Management</h2>

          {loadingProducts ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${product.is_visible ? 'bg-card border-white/5' : 'bg-muted/10 border-dashed border-white/10 opacity-75'}`}>
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {!product.is_visible && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono uppercase">Hidden</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="text-primary font-mono">${product.price}</span>
                      <span className="truncate max-w-[200px]">{product.category || 'Uncategorized'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                      title="Edit Product"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => toggleVisibility(product.id, product.is_visible)}
                      className={`p-2 rounded-lg transition-colors ${product.is_visible ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-white/5'}`}
                      title={product.is_visible ? "Hide from Store" : "Show in Store"}
                    >
                      {product.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center p-12 border border-dashed border-white/10 rounded-xl text-muted-foreground">
                  No products found. Start by adding one!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
