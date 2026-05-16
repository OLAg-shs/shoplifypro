import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, Palette, Type, Upload, Download, Share2, Sparkles,
  ChevronLeft, ChevronRight, Check, Image as ImageIcon,
  MessageCircle, Copy, Instagram, Loader2, Tag, DollarSign, AlignLeft
} from 'lucide-react';
import html2canvas from 'html2canvas';

// ── Template definitions ───────────────────────────────────────────────────────
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
  const productImgInputRef = useRef(null);

  // ── Brand identity (saved permanently) ──────────────────────────────────────
  const [brand, setBrand] = useState(() => {
    const saved = localStorage.getItem('ec_brand_identity');
    return saved ? JSON.parse(saved) : {
      name: 'My Brand',
      tagline: 'Quality you can trust',
      accentColor: '#7c3aed',
      bgColor: '#0f172a',
      textColor: '#ffffff',
      template: 'spotlight',
      logoUrl: null,
    };
  });

  // ── Active product on card ───────────────────────────────────────────────────
  const [product, setProduct] = useState({
    name: 'Premium Wireless Headphones',
    price: '$199.99',
    description: 'Experience pure audio fidelity with 40-hour battery life.',
    tags: ['Electronics', 'Audio', 'Wireless'],
    imageUrl: null,
  });

  const [activeTab, setActiveTab] = useState('brand'); // 'brand' | 'product' | 'share'
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templateIdx, setTemplateIdx] = useState(
    TEMPLATES.findIndex(t => t.id === brand.template) || 0
  );

  // Save brand identity automatically on change
  useEffect(() => {
    localStorage.setItem('ec_brand_identity', JSON.stringify(brand));
  }, [brand]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBrand(b => ({ ...b, logoUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleProductImgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProduct(p => ({ ...p, imageUrl: ev.target.result }));
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
      link.download = `${brand.name.replace(/\s+/g, '-').toLowerCase()}-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Check out ${product.name} - ${product.price}\n${product.description}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── CARD RENDERER ─────────────────────────────────────────────────────────────
  const renderCard = () => {
    const t = brand.template;
    const accent = brand.accentColor;
    const bg = brand.bgColor;
    const text = brand.textColor;

    const baseCard = {
      width: '420px', height: '520px',
      background: bg, borderRadius: '24px',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: text,
      boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}30`,
    };

    return (
      <div ref={cardRef} style={baseCard}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: accent, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: accent, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15 }} />

        {/* Header */}
        <div style={{ padding: '28px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
            : <span style={{ fontWeight: 900, fontSize: '1rem', color: accent, letterSpacing: '-0.02em' }}>{brand.name}</span>
          }
          <span style={{ background: `${accent}25`, color: accent, fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.08em', border: `1px solid ${accent}40` }}>
            {t === 'luxury' ? '✦ EXCLUSIVE' : t === 'editorial' ? 'FEATURED' : 'NEW ARRIVAL'}
          </span>
        </div>

        {/* Product image */}
        <div style={{ flex: 1, margin: '0 28px', borderRadius: '16px', overflow: 'hidden', background: `rgba(255,255,255,0.04)`, border: `1px solid rgba(255,255,255,0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', opacity: 0.3 }}>
                <ImageIcon size={48} />
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem' }}>Upload product image</p>
              </div>
          }
        </div>

        {/* Product info */}
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

          {/* CTA bar */}
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          <Layers size={13} /> BRAND PRODUCT BUILDER
        </div>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>Design Your Product Cards</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Set up your brand identity once. Generate beautiful product cards to share anywhere.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
        {/* ── LEFT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            {[['brand', '🎨 Brand'], ['product', '📦 Product'], ['share', '📤 Share']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s', background: activeTab === id ? 'var(--primary)' : 'transparent', color: activeTab === id ? 'white' : 'var(--text-muted)' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* ── BRAND TAB ── */}
            {activeTab === 'brand' && <>
              <Field label="Brand Name" icon={<Type size={14} />}>
                <input className="input-field" value={brand.name} onChange={e => setBrand(b => ({...b, name: e.target.value}))} />
              </Field>
              <Field label="Tagline" icon={<AlignLeft size={14} />}>
                <input className="input-field" value={brand.tagline} onChange={e => setBrand(b => ({...b, tagline: e.target.value}))} />
              </Field>
              <Field label="Brand Logo" icon={<ImageIcon size={14} />}>
                <button onClick={() => logoInputRef.current.click()} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Upload size={14} /> {brand.logoUrl ? 'Change Logo' : 'Upload Logo PNG'}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <ColorPicker label="Accent" value={brand.accentColor} onChange={v => setBrand(b => ({...b, accentColor: v}))} />
                <ColorPicker label="Background" value={brand.bgColor} onChange={v => setBrand(b => ({...b, bgColor: v}))} />
                <ColorPicker label="Text" value={brand.textColor} onChange={v => setBrand(b => ({...b, textColor: v}))} />
              </div>
              <Field label="Card Template" icon={<Sparkles size={14} />}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => handleTemplateChange(-1)} style={arrowBtn}><ChevronLeft size={18} /></button>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{TEMPLATES[templateIdx].name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{TEMPLATES[templateIdx].desc}</div>
                  </div>
                  <button onClick={() => handleTemplateChange(1)} style={arrowBtn}><ChevronRight size={18} /></button>
                </div>
              </Field>
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#34d399', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Check size={14} /> Brand identity auto-saved. Applies to all your product cards.
              </div>
            </>}

            {/* ── PRODUCT TAB ── */}
            {activeTab === 'product' && <>
              <Field label="Product Image" icon={<ImageIcon size={14} />}>
                <button onClick={() => productImgInputRef.current.click()} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Upload size={14} /> {product.imageUrl ? 'Change Product Image' : 'Upload Product Image'}
                </button>
                <input ref={productImgInputRef} type="file" accept="image/*" hidden onChange={handleProductImgUpload} />
              </Field>
              <Field label="Product Name" icon={<Type size={14} />}>
                <input className="input-field" value={product.name} onChange={e => setProduct(p => ({...p, name: e.target.value}))} />
              </Field>
              <Field label="Price" icon={<DollarSign size={14} />}>
                <input className="input-field" value={product.price} onChange={e => setProduct(p => ({...p, price: e.target.value}))} />
              </Field>
              <Field label="Short Description" icon={<AlignLeft size={14} />}>
                <textarea className="input-field" rows={3} value={product.description} onChange={e => setProduct(p => ({...p, description: e.target.value}))} style={{ resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }} />
              </Field>
              <Field label="Tags (comma separated)" icon={<Tag size={14} />}>
                <input className="input-field" value={product.tags.join(', ')}
                  onChange={e => setProduct(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  placeholder="e.g. Electronics, Audio, Wireless"
                />
              </Field>
            </>}

            {/* ── SHARE TAB ── */}
            {activeTab === 'share' && <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Download your HD card or share it directly to social media.</p>
              <button onClick={handleDownload} disabled={isDownloading} style={{ ...actionBtn, background: 'linear-gradient(135deg, var(--primary), #ec4899)' }}>
                {isDownloading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                {isDownloading ? 'Generating HD...' : 'Download HD Card (1080p)'}
              </button>
              <button onClick={handleShareWhatsApp} style={{ ...actionBtn, background: '#25D366' }}>
                <MessageCircle size={18} /> Share on WhatsApp
              </button>
              <button onClick={handleCopyLink} style={{ ...actionBtn, background: copied ? '#16a34a' : 'rgba(255,255,255,0.08)', color: copied ? 'white' : 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Share Link'}
              </button>
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }}>💡 Tip</strong>
                Download the card first, then upload it directly to Instagram, TikTok, or Twitter for the best quality.
              </div>
            </>}
          </div>
        </div>

        {/* ── RIGHT: LIVE CARD PREVIEW ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>Live Preview</p>
          <div style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
            {renderCard()}
          </div>
          <button onClick={handleDownload} disabled={isDownloading}
            style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(236,72,153,0.5)' }}>
            {isDownloading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
            Download HD Card
          </button>
        </div>
      </div>

      <style>{`
        .input-field { width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 0.9rem; transition: border-color 0.2s; box-sizing: border-box; }
        .input-field:focus { outline: none; border-color: var(--primary); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ── Small helpers ──────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
      {icon} {label}
    </label>
    {children}
  </div>
);

const ColorPicker = ({ label, value, onChange }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
    <label style={{ display: 'block', cursor: 'pointer' }}>
      <div style={{ width: '100%', height: '40px', borderRadius: '10px', background: value, border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} />
      <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }} />
    </label>
  </div>
);

const arrowBtn = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const actionBtn = { width: '100%', padding: '12px 16px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'opacity 0.2s' };

export default BrandProductBuilder;
