import React, { useState, useEffect } from 'react';
import { Package, Upload, Trash2, PlusCircle, ImageIcon, CheckCircle, Loader, X, Wand2 } from 'lucide-react';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import { api } from '../utils/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    imageUrl: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setNewProduct(p => ({ ...p, imageFile: file, imagePreview: preview }));
    setUploadStatus('');
  };

  const handleUploadImage = async () => {
    if (!newProduct.imageFile) return;
    setUploading(true);
    setUploadStatus('Processing with Neural Engine...');

    try {
      // Local AI removal using fully local models folder
      const config = {
        publicPath: `${window.location.origin}/models/`,
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setUploadStatus(`Loading AI Model... ${percent}%`);
        }
      };
      
      const blob = await imglyRemoveBackground(newProduct.imageFile, config);
      const url = URL.createObjectURL(blob);
      
      // For real implementation, we would upload this blob to Supabase storage or Cloudinary
      // Here we simulate the upload and get a URL
      const formData = new FormData();
      formData.append('image', blob, 'processed.png');
      
      const uploadData = await api.upload('/upload/image', formData);
      
      setNewProduct(p => ({ ...p, imageUrl: uploadData.url, imagePreview: uploadData.url, imageFile: null }));
      setUploadStatus('✅ Studio-quality background removed!');
    } catch (localError) {
      console.warn('Local AI removal failed, falling back to basic upload...', localError);
      try {
        const formData = new FormData();
        formData.append('image', newProduct.imageFile);
        const uploadData = await api.upload('/upload/image', formData);
        setNewProduct(p => ({ ...p, imageUrl: uploadData.url, imagePreview: uploadData.url, imageFile: null }));
        setUploadStatus('✅ Original image uploaded successfully.');
      } catch (uploadError) {
        setUploadStatus('❌ Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        description: newProduct.description,
        images: newProduct.imageUrl ? [newProduct.imageUrl] : [],
        is_active: true
      };
      
      await api.post('/products', productData);
      
      // Reset and refresh
      setNewProduct({ name: '', price: '', category: '', stock: '', description: '', imageFile: null, imagePreview: null, imageUrl: null });
      setUploadStatus('');
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert("Error adding product: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Page Header */}
      <div className="animate-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage inventory and optimize product presentation.</p>
        </div>
        <button
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setShowForm(!showForm)}
          style={{ height: '52px', padding: '0 2rem' }}
        >
          {showForm ? <><X size={18} /> Cancel</> : <><PlusCircle size={18} /> Add New Product</>}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="card animate-up" style={{ marginBottom: '4rem', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Add New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
              {/* Left Column: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Premium Leather Bag" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>List Price ($)</label>
                    <input type="number" className="input-field" placeholder="0.00" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Stock Level</label>
                    <input type="number" className="input-field" placeholder="Quantity" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select className="input-field" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} required>
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Apparel</option>
                    <option>Accessories</option>
                    <option>Home Decor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Marketing Description</label>
                  <textarea className="input-field" rows={4} placeholder="Describe the value of this product..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>

              {/* Right Column: AI Visuals */}
              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-medium)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wand2 size={18} /> Visual Optimizer
                </h4>
                
                <div style={{ 
                  width: '100%', 
                  height: '240px', 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1.5px dashed var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  overflow: 'hidden'
                }}>
                  {newProduct.imagePreview ? (
                    <img src={newProduct.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.875rem' }}>Upload a photo to optimize</p>
                    </div>
                  )}
                </div>

                <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', marginBottom: '1rem' }}>
                  <Upload size={18} /> Choose Product Image
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </label>

                {newProduct.imageFile && (
                  <button type="button" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem', background: 'var(--primary)' }} onClick={handleUploadImage} disabled={uploading}>
                    {uploading ? <Loader size={18} className="spinner" /> : 'Run Neural BG Removal'}
                  </button>
                )}

                {uploadStatus && (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    background: uploadStatus.includes('✅') ? '#ecfdf5' : '#fff7ed',
                    color: uploadStatus.includes('✅') ? '#059669' : '#ea580c',
                    border: `1px solid ${uploadStatus.includes('✅') ? '#a7f3d0' : '#ffedd5'}`
                  }}>
                    {uploadStatus}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-medium)', paddingTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem' }} disabled={submitting}>
                {submitting ? <Loader size={20} className="spinner" /> : <><CheckCircle size={20} /> Finalize and Publish</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table */}
      <div className="card animate-up" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active Catalog ({products.length})</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loadingProducts ? 'Refreshing catalog...' : 'All systems operational'}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {products.length === 0 && !loadingProducts && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No products found. Start by adding your first product!
            </div>
          )}
          {products.map((product, idx) => (
            <div key={product.id} className="animate-up" style={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 1fr 120px 120px 140px 80px',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: idx === products.length - 1 ? 'none' : '1px solid var(--border-medium)',
              gap: '2rem',
              transition: 'background 0.2s ease'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {product.images && product.images[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} style={{ color: '#cbd5e1' }} />}
              </div>
              
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '4px' }}>{product.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{product.category}</div>
              </div>

              <div style={{ fontWeight: '800', fontSize: '1.15rem' }}>${parseFloat(product.price).toFixed(2)}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{product.stock}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory</div>
              </div>

              <div>
                <span style={{ 
                   padding: '6px 12px', 
                   borderRadius: '100px', 
                   fontSize: '0.75rem', 
                   fontWeight: '700',
                   background: product.is_active ? '#f0fdf4' : '#f1f5f9',
                   color: product.is_active ? '#16a34a' : '#64748b',
                   border: `1px solid ${product.is_active ? '#bbf7d0' : '#e2e8f0'}`
                 }}>
                   {product.is_active ? '✨ ACTIVE' : 'HIDDEN'}
                 </span>
              </div>

              <button className="btn-secondary" style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(product.id)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
