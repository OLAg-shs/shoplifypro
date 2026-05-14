import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Save, Layout, Smartphone, Monitor, Wand2, CheckCircle2, Loader, AlertCircle, Check } from 'lucide-react';
import { api } from '../utils/api';

const StoreBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [store, setStore] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  const [storeTheme, setStoreTheme] = useState({
    name: 'My Store',
    primaryColor: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: "'Inter', sans-serif",
    layoutStyle: 'modern',
  });

  // Load existing store on mount
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await api.get('/stores/mine');
        if (data?.hasStore) {
          setStore(data);
          setStoreTheme({
            name: data.name || 'My Store',
            primaryColor: data.branding?.primaryColor || '#2563eb',
            backgroundColor: data.branding?.backgroundColor || '#ffffff',
            textColor: data.branding?.textColor || '#0f172a',
            fontFamily: data.branding?.fontFamily || "'Inter', sans-serif",
            layoutStyle: data.branding?.layoutStyle || 'modern',
          });
        }
      } catch {
        // No store yet
      }
    };
    fetchStore();
  }, []);

  const showSave = (msg, isErr = false) => {
    if (isErr) setError(msg);
    else { setSaveMsg(msg); setError(''); }
    setTimeout(() => { setSaveMsg(''); setError(''); }, 3000);
  };

  // Generate theme via AI backend
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await api.post('/ai/generate-theme', { prompt });
      if (result.theme) {
        setStoreTheme(t => ({
          ...t,
          primaryColor: result.theme.primaryColor || t.primaryColor,
          backgroundColor: result.theme.backgroundColor || t.backgroundColor,
          textColor: result.theme.textColor || t.textColor,
          fontFamily: result.theme.fontFamily || t.fontFamily,
          layoutStyle: result.theme.layoutStyle || t.layoutStyle,
        }));
        showSave('✨ AI theme applied! Customize further and save.');
      }
    } catch (err) {
      showSave(err.message || 'AI generation failed.', true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save branding to backend
  const handleSaveBranding = async () => {
    if (!store) {
      showSave('Create a store first (contact admin for approval).', true);
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.put(`/stores/${store.id}`, {
        name: storeTheme.name,
        branding: {
          primaryColor: storeTheme.primaryColor,
          backgroundColor: storeTheme.backgroundColor,
          textColor: storeTheme.textColor,
          fontFamily: storeTheme.fontFamily,
          layoutStyle: storeTheme.layoutStyle,
        },
      });
      setStore(updated);
      showSave('✅ Branding saved successfully!');
    } catch (err) {
      showSave(err.message || 'Save failed.', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish store
  const handlePublish = async () => {
    if (!store) return;
    setIsPublishing(true);
    try {
      // Save branding first, then publish
      const updated = await api.put(`/stores/${store.id}`, {
        name: storeTheme.name,
        branding: {
          primaryColor: storeTheme.primaryColor,
          backgroundColor: storeTheme.backgroundColor,
          textColor: storeTheme.textColor,
          fontFamily: storeTheme.fontFamily,
          layoutStyle: storeTheme.layoutStyle,
        },
        is_published: !store.is_published,
      });
      setStore(updated);
      showSave(updated.is_published ? '🚀 Store is now LIVE!' : 'Store set to Draft.');
    } catch (err) {
      showSave(err.message || 'Publish failed.', true);
    } finally {
      setIsPublishing(false);
    }
  };

  const isLive = store?.is_published;

  return (
    <div className="customizer-layout animate-up">
      {/* ── Settings Panel ── */}
      <div className="sidebar" style={{ width: '400px', height: 'auto', minHeight: 'calc(100vh - 72px)', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '5px 12px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', border: '1px solid #ddd6fe', gap: '5px', alignItems: 'center' }}>
            <Sparkles size={12} /> AI GENERATIVE ENGINE
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Store Builder</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Describe your vision and let AI craft your storefront.</p>
        </div>

        {/* Store status */}
        {store && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: isLive ? '#ecfdf5' : '#fef9c3', border: `1px solid ${isLive ? '#bbf7d0' : '#fde68a'}`, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: isLive ? '#059669' : '#92400e' }}>
              {isLive ? 'Store is LIVE' : 'Store is in Draft'}
            </span>
          </div>
        )}

        {/* Save/Error messages */}
        {saveMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> {saveMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* AI Prompt */}
        <form onSubmit={handleGenerate} style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>AI Design Prompt</label>
          <textarea
            className="input-field" rows={3}
            placeholder="E.g. A luxury jewelry store with gold tones, elegant serif fonts and dark backgrounds..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ marginBottom: '0.75rem', resize: 'vertical' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }} disabled={isGenerating || !prompt.trim()}>
            {isGenerating
              ? <><LoaderIcon size={16} /> Generating…</>
              : <><Wand2 size={16} /> Generate with AI</>
            }
          </button>
        </form>

        {/* Manual adjustments */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Palette size={16} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Visual Adjustments</h3>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Store Name</label>
            <input type="text" className="input-field" value={storeTheme.name}
              onChange={(e) => setStoreTheme({ ...storeTheme, name: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Accent Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={storeTheme.primaryColor}
                  onChange={(e) => setStoreTheme({ ...storeTheme, primaryColor: e.target.value })}
                  style={{ width: '40px', height: '40px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }} />
                <code style={{ fontSize: '0.8rem', color: '#64748b' }}>{storeTheme.primaryColor}</code>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Background</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={storeTheme.backgroundColor}
                  onChange={(e) => setStoreTheme({ ...storeTheme, backgroundColor: e.target.value })}
                  style={{ width: '40px', height: '40px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }} />
                <code style={{ fontSize: '0.8rem', color: '#64748b' }}>{storeTheme.backgroundColor}</code>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Font Family</label>
            <select className="input-field" value={storeTheme.fontFamily}
              onChange={e => setStoreTheme({ ...storeTheme, fontFamily: e.target.value })}>
              <option value="'Inter', sans-serif">Inter (Modern)</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
              <option value="'Outfit', sans-serif">Outfit (Bold)</option>
              <option value="'Playfair Display', serif">Playfair Display (Luxury)</option>
              <option value="'DM Sans', sans-serif">DM Sans (Clean)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleSaveBranding} disabled={isSaving || !store}
            style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isSaving ? <LoaderIcon size={16} /> : <Save size={16} />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
          <button className="btn btn-primary" onClick={handlePublish} disabled={isPublishing || !store}
            style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: isLive ? '#dc2626' : undefined }}>
            {isPublishing ? <LoaderIcon size={16} /> : <CheckCircle2 size={16} />}
            {isPublishing ? 'Updating…' : isLive ? 'Unpublish Store' : 'Publish to Live'}
          </button>
          {!store && (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Your store will be created automatically after admin approval.
            </p>
          )}
        </div>
      </div>

      {/* ── Live Preview Canvas ── */}
      <div className="preview-area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
          {/* Device Toggles */}
          <div style={{ background: 'white', padding: '5px', borderRadius: '100px', display: 'flex', gap: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {[
              { mode: 'desktop', icon: Monitor, label: 'Desktop' },
              { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
            ].map(({ mode, icon: Icon, label }) => (
              <button key={mode} onClick={() => setPreviewMode(mode)} style={{
                background: previewMode === mode ? '#f1f5f9' : 'transparent',
                border: 'none', padding: '8px 16px', borderRadius: '100px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                color: previewMode === mode ? '#0f172a' : '#94a3b8',
                fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s ease'
              }}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Virtual Device */}
          <div style={{
            width: previewMode === 'desktop' ? '100%' : '375px',
            maxWidth: '1000px', height: '750px',
            background: storeTheme.backgroundColor,
            borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            overflowY: 'auto', border: '1px solid #e2e8f0',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: storeTheme.fontFamily,
          }}>
            {/* Store Preview Nav */}
            <nav style={{ padding: '20px 32px', borderBottom: `1px solid ${storeTheme.primaryColor}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: storeTheme.backgroundColor }}>
              <h2 style={{ color: storeTheme.primaryColor, margin: 0, fontWeight: 800, fontSize: '1.2rem', fontFamily: storeTheme.fontFamily }}>{storeTheme.name}</h2>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: '600', color: storeTheme.textColor }}>
                <span style={{ cursor: 'pointer', opacity: 0.7 }}>Collection</span>
                <span style={{ cursor: 'pointer', opacity: 0.7 }}>About</span>
                <span style={{ cursor: 'pointer', opacity: 0.7 }}>Support</span>
              </div>
            </nav>

            {/* Hero Section */}
            <section style={{ padding: previewMode === 'desktop' ? '80px 40px' : '60px 24px', textAlign: 'center', background: storeTheme.backgroundColor }}>
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '100px', background: `${storeTheme.primaryColor}15`, color: storeTheme.primaryColor, fontSize: '0.8rem', fontWeight: '700', marginBottom: '20px' }}>
                ✦ New Collection
              </div>
              <h1 style={{ fontSize: previewMode === 'desktop' ? '3.5rem' : '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px', color: storeTheme.textColor, fontFamily: storeTheme.fontFamily }}>
                Crafted for the<br />Modern World.
              </h1>
              <p style={{ fontSize: '1rem', opacity: 0.6, maxWidth: '480px', margin: '0 auto 32px', color: storeTheme.textColor, lineHeight: 1.6 }}>
                Discover a curated collection of premium essentials designed for those who demand excellence.
              </p>
              <button style={{ background: storeTheme.primaryColor, color: 'white', padding: '14px 36px', borderRadius: '100px', border: 'none', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', fontFamily: storeTheme.fontFamily }}>
                Explore Collection
              </button>
            </section>

            {/* Product Grid */}
            <div style={{ padding: '0 32px 60px', display: 'grid', gridTemplateColumns: previewMode === 'desktop' ? 'repeat(3, 1fr)' : '1fr', gap: '24px' }}>
              {['Essential Item 01', 'Premium Edition 02', 'Signature Series 03'].map((name, i) => (
                <div key={i} style={{ textAlign: 'left' }}>
                  <div style={{ width: '100%', height: '240px', background: `${storeTheme.primaryColor}08`, borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${storeTheme.primaryColor}20` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: storeTheme.primaryColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>New Arrival</div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px', color: storeTheme.textColor, fontFamily: storeTheme.fontFamily }}>{name}</h4>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem', color: storeTheme.primaryColor, margin: 0 }}>${(129 + i * 40).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline spinner
const LoaderIcon = ({ size }) => (
  <div style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
);

export default StoreBuilder;
