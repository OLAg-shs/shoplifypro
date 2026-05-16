import React, { useState, useRef } from 'react';
import { 
  Sparkles, Upload, Image as ImageIcon, Wand2, Download, 
  Loader2, CheckCircle, Plus, LayoutGrid, X
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { api } from '../utils/api';

const STUDIO_BACKGROUNDS = [
  { id: 'transparent', name: 'Transparent', style: { background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgvwMDA/xVIMzIwMDAzMDKgS2BVA8GAwWgYjIaB2TCAnbFjDIfBiQEAsVwQ/7W6aLgAAAAASUVORK5CYII=)' } },
  { id: 'pure-white',  name: 'Pure White',  style: { background: '#ffffff' } },
  { id: 'soft-gray',   name: 'Soft Gray',   style: { background: '#f3f4f6' } },
  { id: 'warm-sand',   name: 'Warm Sand',   style: { background: '#f5efe6' } },
  { id: 'dark-slate',  name: 'Dark Slate',  style: { background: '#0f172a' } },
  { id: 'neon-glow',   name: 'Neon Glow',   style: { background: 'linear-gradient(135deg, #7c3aed, #ec4899)' } },
];

const ProductStudio = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null); // URL of transparent PNG
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [activeBg, setActiveBg] = useState(STUDIO_BACKGROUNDS[1]); // Default pure white
  
  // Create Product Modal State
  const [showModal, setShowModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [productData, setProductData] = useState({
    name: '', price: '', category: '', stock: '10', description: '', tags: ''
  });

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setOriginalImage(URL.createObjectURL(file));
    setProcessedUrl(null);
    setIsProcessing(true);
    setStatus('Initializing Neural Engine...');

    try {
      const config = {
        publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.5.5/dist/",
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setStatus(`Loading AI Model... ${percent}%`);
        }
      };
      
      // Run local neural background removal
      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setStatus('');
    } catch (err) {
      console.error('BG Removal error:', err);
      setStatus('Background removal failed. Please try a clearer image.');
      // Fallback: just use the original image
      setProcessedUrl(URL.createObjectURL(file));
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to bake the background and image into a single Blob
  const createFinalImageBlob = async () => {
    if (!previewRef.current) return null;
    
    // We use html2canvas for ease, or draw directly to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = processedUrl;
    
    return new Promise((resolve) => {
      img.onload = () => {
        // High-res output
        canvas.width = 1080;
        canvas.height = 1080;
        
        // Draw background
        if (activeBg.id === 'transparent') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (activeBg.style.background.includes('linear-gradient')) {
          const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grd.addColorStop(0, "#7c3aed");
          grd.addColorStop(1, "#ec4899");
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = activeBg.style.background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw image perfectly centered, containing within bounds
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        // Add subtle drop shadow if not dark mode or transparent
        if (activeBg.id !== 'transparent' && activeBg.id !== 'dark-slate' && activeBg.id !== 'neon-glow') {
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;
        }
        
        ctx.drawImage(img, x, y, w, h);
        canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
      };
    });
  };

  const handleDownload = async () => {
    setStatus('Generating HD file...');
    const blob = await createFinalImageBlob();
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-studio-${Date.now()}.png`;
    link.click();
    setStatus('');
  };

  const handlePublishToStore = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setStatus('Uploading high-res image...');
    
    try {
      const blob = await createFinalImageBlob();
      
      // Upload image first
      const formData = new FormData();
      formData.append('image', blob, 'studio-product.png');
      const uploadData = await api.upload('/upload/image', formData);
      
      // Create product
      setStatus('Publishing product...');
      const newProductData = {
        name: productData.name,
        price: parseFloat(productData.price),
        category: productData.category,
        stock: parseInt(productData.stock),
        description: productData.description,
        images: [uploadData.url],
        is_active: true
      };
      
      await api.post('/products', newProductData);
      
      setStatus('✅ Product successfully published!');
      setTimeout(() => {
        setShowModal(false);
        setStatus('');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to publish product.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '1rem' }}>
            <Sparkles size={13} /> FREE AI TOOL
          </div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>AI Product Editor</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Instantly remove backgrounds, apply studio lighting, and publish directly to your store.
          </p>
        </div>
        
        {processedUrl && (
          <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)' }}>
            <Plus size={20} /> Create Product
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', minHeight: '600px' }}>
        
        {/* Main Canvas Area */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          
          {!originalImage && !isProcessing && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem' }}>Upload Product Photo</h3>
              <button onClick={() => fileInputRef.current.click()} style={{ padding: '12px 32px', background: 'white', color: '#111', border: 'none', borderRadius: '100px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                Select Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
            </div>
          )}

          {isProcessing && (
            <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
              <Wand2 size={48} className="spinner" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{status || 'Extracting subject perfectly...'}</div>
            </div>
          )}

          {processedUrl && !isProcessing && (
            <div 
              ref={previewRef}
              style={{ 
                width: '100%', height: '100%', 
                ...activeBg.style,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease'
              }}
            >
              <img 
                src={processedUrl} 
                alt="Processed" 
                style={{ 
                  maxWidth: '90%', maxHeight: '90%', objectFit: 'contain',
                  filter: activeBg.id !== 'transparent' && activeBg.id !== 'dark-slate' && activeBg.id !== 'neon-glow' 
                    ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' : 'none',
                  transition: 'filter 0.3s ease'
                }} 
              />
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Studio Background</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {STUDIO_BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setActiveBg(bg)}
                  disabled={!processedUrl}
                  style={{
                    padding: '12px 8px', borderRadius: '12px', border: activeBg.id === bg.id ? '2px solid var(--primary)' : '2px solid transparent',
                    background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: processedUrl ? 'pointer' : 'not-allowed',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: processedUrl ? 1 : 0.5, transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '100%', height: '40px', borderRadius: '6px', ...bg.style, border: '1px solid rgba(255,255,255,0.1)' }} />
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { setOriginalImage(null); setProcessedUrl(null); }}
                style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Upload New Image
              </button>
              <button 
                onClick={handleDownload}
                disabled={!processedUrl}
                style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: processedUrl ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: processedUrl ? 1 : 0.5 }}
              >
                <Download size={18} /> Download HD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CREATE PRODUCT MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-up" style={{ width: '600px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)' }}>
            
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                <LayoutGrid size={24} color="var(--primary)" /> Publish to Store
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handlePublishToStore} style={{ padding: '32px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>PRODUCT NAME</label>
                  <input type="text" required value={productData.name} onChange={e => setProductData(p => ({...p, name: e.target.value}))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>PRICE ($)</label>
                  <input type="number" step="0.01" required value={productData.price} onChange={e => setProductData(p => ({...p, price: e.target.value}))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>CATEGORY</label>
                  <select required value={productData.category} onChange={e => setProductData(p => ({...p, category: e.target.value}))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}>
                    <option value="">Select Category</option>
                    <option>Apparel</option><option>Electronics</option><option>Accessories</option><option>Home</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>TAGS (comma separated)</label>
                  <input type="text" value={productData.tags} onChange={e => setProductData(p => ({...p, tags: e.target.value}))}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>DESCRIPTION</label>
                <textarea rows={3} required value={productData.description} onChange={e => setProductData(p => ({...p, description: e.target.value}))}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', resize: 'none', fontFamily: 'inherit' }} />
              </div>

              {status && <div style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: status.includes('❌') ? '#ef4444' : '#34d399', fontWeight: 600 }}>{status}</div>}

              <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {isPublishing ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={20} />}
                {isPublishing ? 'Publishing...' : 'Upload & Publish to Store'}
              </button>

            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProductStudio;
