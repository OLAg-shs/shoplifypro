import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, Type, Upload, Download, Share2, Sparkles,
  ChevronLeft, ChevronRight, Check, Image as ImageIcon,
  MessageCircle, Copy, Loader2, Tag, DollarSign, AlignLeft,
  LayoutGrid
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../utils/api';

const TEMPLATES = [
  { id: 'spotlight', name: 'Spotlight', desc: 'Bold product focus' },
  { id: 'minimal',   name: 'Minimal',   desc: 'Clean & elegant' },
  { id: 'luxury',    name: 'Luxury',    desc: 'Premium dark' },
  { id: 'bold',      name: 'Bold',      desc: 'High-energy' },
  { id: 'editorial', name: 'Editorial', desc: 'Magazine style' },
];

const BrandProductBuilder = () => {
  const cardRef = useRef(null);
  const logoInputRef = useRef(null);

  const [brand, setBrand] = useState(() => {
    const saved = localStorage.getItem('ec_brand_identity');
    return saved ? JSON.parse(saved) : {
      name: 'My Brand', tagline: 'Quality you can trust',
      accentColor: '#7c3aed', bgColor: '#0f172a', textColor: '#ffffff',
      template: 'spotlight', logoUrl: null,
    };
  });

  const [product, setProduct] = useState({
    name: 'Select a product...', price: '$0.00',
    description: 'Your product description will appear here.', tags: [], imageUrl: null,
  });

  const [activeTab, setActiveTab] = useState('brand');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templateIdx, setTemplateIdx] = useState(TEMPLATES.findIndex(t => t.id === brand.template) || 0);

  // Store Products State
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => { localStorage.setItem('ec_brand_identity', JSON.stringify(brand)); }, [brand]);

  useEffect(() => {
    if (activeTab === 'product' && storeProducts.length === 0) {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await api.get('/products');
      setStoreProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectProduct = (p) => {
    setProduct({
      name: p.name,
      price: `$${parseFloat(p.price).toFixed(2)}`,
      description: p.description || '',
      tags: p.category ? [p.category] : [],
      imageUrl: p.images?.[0] || null
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBrand(b => ({ ...b, logoUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleTemplateChange = (dir) => {
    const next = (templateIdx + dir + TEMPLATES.length) % TEMPLATES.length;
    setTemplateIdx(next);
    setBrand(b => ({ ...b, template: TEMPLATES[next].id }));
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `${brand.name.replace(/\s+/g, '-').toLowerCase()}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setIsDownloading(false); }
  };

  const generateShareLink = async () => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    const formData = new FormData();
    formData.append('image', blob, 'share-card.png');
    
    const uploadData = await api.upload('/upload/image', formData);
    
    const baseUrl = window.location.origin.includes('localhost') 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const title = encodeURIComponent(`Shop ${product.name} at ${brand.name}`);
    const desc = encodeURIComponent(product.description || 'Check out this amazing product.');
    const imgUrl = encodeURIComponent(uploadData.url);
    const redirect = encodeURIComponent(window.location.origin);
    
    return `${baseUrl}/share?title=${title}&desc=${desc}&img=${imgUrl}&redirect=${redirect}`;
  };

  const handleShareWhatsApp = async () => {
    setIsDownloading(true);
    try {
      const link = await generateShareLink();
      const text = `Check out ${product.name} at ${brand.name}!\nPrice: ${product.price}\n\nShop now: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to generate share link.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    setIsDownloading(true);
    try {
      const link = await generateShareLink();
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to generate share link.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCard = () => {
    const t = brand.template;
    const accent = brand.accentColor;
    const bg = brand.bgColor;
    const text = brand.textColor;

    const baseCard = {
      width: '420px', height: '520px', background: bg, borderRadius: '24px',
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: "'Outfit', 'Inter', sans-serif", color: text,
      boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}30`,
    };

    // Header logic (Logo + Name coexist)
    const renderHeader = (centered = false) => (
      <div style={{ padding: '28px 28px 16px', display: 'flex', justifyContent: centered ? 'center' : 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />}
          {brand.name && <span style={{ fontWeight: 900, fontSize: '1.1rem', color: t === 'luxury' ? '#fff' : accent, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{brand.name}</span>}
        </div>
        {!centered && (
          <span style={{ background: t === 'luxury' ? 'transparent' : `${accent}25`, color: t === 'luxury' ? accent : accent, fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.08em', border: `1px solid ${accent}40` }}>
            NEW ARRIVAL
          </span>
        )}
      </div>
    );

    // Dynamic Image Renderer
    const renderImage = (styleOverrides = {}) => (
      <div style={{ flex: 1, margin: '0 28px', borderRadius: '16px', overflow: 'hidden', background: `rgba(255,255,255,0.04)`, border: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, ...styleOverrides }}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
          : <ImageIcon size={48} style={{ opacity: 0.3 }} /> }
      </div>
    );

    // --- TEMPLATE VARIATIONS ---
    if (t === 'minimal') {
      return (
        <div ref={cardRef} style={{ ...baseCard, background: '#ffffff', color: '#111827', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          {renderHeader()}
          {renderImage({ background: 'transparent', border: 'none' })}
          <div style={{ padding: '16px 28px 28px', zIndex: 2 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>{product.name}</h2>
            <p style={{ margin: '4px 0 12px', fontSize: '0.85rem', color: '#6b7280' }}>{product.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>{product.price}</div>
              <div style={{ padding: '8px 20px', background: '#111827', color: '#fff', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>Shop Now</div>
            </div>
          </div>
        </div>
      );
    }

    if (t === 'luxury') {
      return (
        <div ref={cardRef} style={{ ...baseCard, background: '#0a0a0a', color: '#ffffff' }}>
          {renderHeader(true)}
          {renderImage({ margin: '0', borderRadius: '0', border: 'none', borderTop: `1px solid ${accent}40`, borderBottom: `1px solid ${accent}40`, background: '#111' })}
          <div style={{ padding: '24px 28px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 400, fontFamily: 'serif', letterSpacing: '0.05em' }}>{product.name}</h2>
            <div style={{ fontSize: '1.2rem', color: accent, margin: '8px 0 16px', fontFamily: 'serif', fontStyle: 'italic' }}>{product.price}</div>
            <div style={{ borderBottom: `1px solid ${accent}60`, width: '40px', margin: '0 auto' }}></div>
          </div>
        </div>
      );
    }

    if (t === 'bold') {
      return (
        <div ref={cardRef} style={{ ...baseCard, background: accent }}>
          {/* Large background image */}
          {product.imageUrl && <img src={product.imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, mixBlendMode: 'overlay' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}></div>
          {renderHeader()}
          <div style={{ flex: 1 }}></div>
          <div style={{ padding: '32px', position: 'relative', zIndex: 10 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', marginBottom: '8px' }}>{product.name}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: accent, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{product.price}</div>
          </div>
        </div>
      );
    }

    // Default 'spotlight'
    return (
      <div ref={cardRef} style={baseCard}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: accent, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: accent, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15 }} />
        {renderHeader()}
        {renderImage()}
        <div style={{ padding: '16px 28px 28px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2, color: text }}>{product.name}</h2>
              {product.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {product.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{ background: `${accent}20`, color: accent, fontSize: '0.6rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: accent, lineHeight: 1 }}>{product.price}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.65, lineHeight: 1.5, color: text }}>{product.description}</p>
          <div style={{ marginTop: '14px', background: accent, borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Shop Now</span>
            <span style={{ color: '#fff', fontSize: '1rem' }}>→</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          <Layers size={13} /> BRAND PRODUCT BUILDER
        </div>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>Design Your Product Cards</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Set up your brand identity once. Select products to automatically generate beautiful cards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            {[['brand', '🎨 Brand'], ['product', '📦 Products'], ['share', '📤 Share']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s', background: activeTab === id ? 'var(--primary)' : 'transparent', color: activeTab === id ? 'white' : 'var(--text-muted)' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: '500px' }}>
            
            {/* BRAND TAB */}
            {activeTab === 'brand' && <>
              <Field label="Brand Name">
                <input className="input-field" value={brand.name} onChange={e => setBrand(b => ({...b, name: e.target.value}))} />
              </Field>
              <Field label="Brand Logo">
                <button onClick={() => logoInputRef.current.click()} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Upload size={14} /> {brand.logoUrl ? 'Change Logo' : 'Upload Logo PNG'}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <ColorPicker label="Accent" value={brand.accentColor} onChange={v => setBrand(b => ({...b, accentColor: v}))} />
                <ColorPicker label="Bg" value={brand.bgColor} onChange={v => setBrand(b => ({...b, bgColor: v}))} />
                <ColorPicker label="Text" value={brand.textColor} onChange={v => setBrand(b => ({...b, textColor: v}))} />
              </div>
              <Field label="Card Template">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => handleTemplateChange(-1)} style={arrowBtn}><ChevronLeft size={18} /></button>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{TEMPLATES[templateIdx].name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{TEMPLATES[templateIdx].desc}</div>
                  </div>
                  <button onClick={() => handleTemplateChange(1)} style={arrowBtn}><ChevronRight size={18} /></button>
                </div>
              </Field>
            </>}

            {/* PRODUCT TAB */}
            {activeTab === 'product' && <>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a product from your store to generate its card.</p>
              
              {loadingProducts ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--primary)' }}>
                  <Loader2 size={24} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : storeProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No products in your store yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px', paddingRight: '5px' }}>
                  {storeProducts.map(p => (
                    <div key={p.id} onClick={() => selectProduct(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#000', overflow: 'hidden' }}>
                        {p.images?.[0] ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={20} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>${parseFloat(p.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>}

            {/* SHARE TAB */}
            {activeTab === 'share' && <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Download or share your generated card.</p>
              <button onClick={handleDownload} disabled={isDownloading} style={{ ...actionBtn, background: 'linear-gradient(135deg, var(--primary), #ec4899)' }}>
                {isDownloading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                {isDownloading ? 'Generating...' : 'Download HD Card'}
              </button>
              <button onClick={handleShareWhatsApp} style={{ ...actionBtn, background: '#25D366' }}>
                <MessageCircle size={18} /> Share on WhatsApp
              </button>
              <button onClick={handleCopyLink} style={{ ...actionBtn, background: copied ? '#16a34a' : 'rgba(255,255,255,0.08)' }}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied Link!' : 'Copy Store Link'}
              </button>
            </>}
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>Live Preview</p>
          <div style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
            {renderCard()}
          </div>
        </div>
      </div>

      <style>{`
        .input-field { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 0.9rem; transition: border-color 0.2s; box-sizing: border-box; }
        .input-field:focus { outline: none; border-color: var(--primary); }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</label>
    {children}
  </div>
);

const ColorPicker = ({ label, value, onChange }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <div style={{ width: '100%', height: '36px', borderRadius: '8px', background: value, border: '2px solid rgba(255,255,255,0.1)' }} />
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ opacity: 0, position: 'absolute' }} />
    </label>
  </div>
);

const arrowBtn = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const actionBtn = { width: '100%', padding: '12px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

export default BrandProductBuilder;
