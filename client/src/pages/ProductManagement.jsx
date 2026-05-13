import React, { useState } from 'react';
import { Package, Upload, Trash2, PlusCircle, ImageIcon, CheckCircle, Loader } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones Pro', price: 199.99, category: 'Electronics', stock: 25, image: null, bgRemoved: false },
  { id: 2, name: 'Leather Minimalist Wallet', price: 49.99, category: 'Accessories', stock: 100, image: null, bgRemoved: false },
  { id: 3, name: 'Sport Running Shoes', price: 129.99, category: 'Footwear', stock: 50, image: null, bgRemoved: true },
];

const ProductManagement = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    imageFile: null,
    imagePreview: null,
  });

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
    setUploadStatus('Removing background...');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', newProduct.imageFile);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      setNewProduct(p => ({ ...p, imagePreview: data.url, imageFile: null }));
      setUploadStatus('✅ Background removed successfully!');
    } catch {
      // If the server isn't running/Cloudinary not configured, keep local preview
      setUploadStatus('⚠️ Background removal requires Cloudinary. Using original image.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock),
      image: newProduct.imagePreview,
      bgRemoved: uploadStatus.includes('✅'),
    };
    setProducts(prev => [product, ...prev]);
    setNewProduct({ name: '', price: '', category: '', stock: '', description: '', imageFile: null, imagePreview: null });
    setUploadStatus('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={28} style={{ color: 'var(--primary)' }} />
            <h1 style={{ margin: 0 }}>Product Management</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
            Manage your store products with AI-powered image processing
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          id="add-product-btn"
        >
          <PlusCircle size={18} />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Left: Form Fields */}
              <div>
                <div className="input-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    id="product-name"
                    className="input-field"
                    placeholder="e.g., Wireless Bluetooth Speaker"
                    value={newProduct.name}
                    onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      id="product-price"
                      className="input-field"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      id="product-stock"
                      className="input-field"
                      placeholder="0"
                      min="0"
                      value={newProduct.stock}
                      onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <select
                    id="product-category"
                    className="input-field"
                    value={newProduct.category}
                    onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                    required
                  >
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Footwear</option>
                    <option>Accessories</option>
                    <option>Home & Living</option>
                    <option>Sports</option>
                    <option>Beauty</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    id="product-description"
                    className="input-field"
                    rows={3}
                    placeholder="Describe your product..."
                    value={newProduct.description}
                    onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Right: Image Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Product Image
                </label>

                {/* Image Preview */}
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed var(--glass-border)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    background: 'rgba(15,23,42,0.3)',
                    position: 'relative',
                  }}
                >
                  {newProduct.imagePreview ? (
                    <img
                      src={newProduct.imagePreview}
                      alt="Product preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={48} style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No image selected</p>
                    </div>
                  )}
                </div>

                <label htmlFor="image-upload" className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Upload size={18} />
                  Choose Image
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {newProduct.imageFile && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                    onClick={handleUploadImage}
                    disabled={uploading}
                    id="remove-bg-btn"
                  >
                    {uploading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : '✨ Remove Background (AI)'}
                  </button>
                )}

                {uploadStatus && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: uploadStatus.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${uploadStatus.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    color: uploadStatus.includes('✅') ? '#34d399' : '#fbbf24',
                  }}>
                    {uploadStatus}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" id="save-product-btn">
                <CheckCircle size={18} />
                Save Product
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem' }}>Your Products ({products.length})</h2>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p>No products yet. Click "Add Product" to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(product => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto auto auto auto',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(15,23,42,0.4)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  transition: 'background 0.2s ease',
                }}
              >
                {/* Image */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                }}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <ImageIcon size={24} style={{ opacity: 0.4 }} />
                  }
                </div>

                {/* Info */}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.category}</div>
                </div>

                {/* Price */}
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                  ${product.price.toFixed(2)}
                </div>

                {/* Stock */}
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {product.stock} in stock
                </div>

                {/* BG Removed Badge */}
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: product.bgRemoved ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)',
                  color: product.bgRemoved ? '#34d399' : 'var(--text-muted)',
                  border: `1px solid ${product.bgRemoved ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {product.bgRemoved ? '✨ BG Removed' : 'Original'}
                </div>

                {/* Delete */}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px', borderRadius: '8px' }}
                  onClick={() => handleDelete(product.id)}
                  title="Delete product"
                >
                  <Trash2 size={16} style={{ color: '#f87171' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
